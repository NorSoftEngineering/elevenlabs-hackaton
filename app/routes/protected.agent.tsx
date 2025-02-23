import { Form, redirect, useLoaderData, useNavigation, useSubmit } from 'react-router';

import { useConversation } from '@11labs/react';
import { CheckCircle2, Circle, Pause, Play, Send, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router';
import { LottieAvatar } from '~/components/LottieAvatar';
import { Card } from '~/components/ui/card';
import { cn } from '~/lib/utils';
import { getEnv } from '~/utils/env.server';
import { analyzeCheckpointCompletion } from '~/utils/openai.server';
import { createSupabaseServer } from '~/utils/supabase.server';

// Message types
type MessageSource = 'user' | 'assistant';

// Helper to ensure valid message source
function normalizeMessageSource(source: string): MessageSource {
	return source === 'user' ? 'user' : 'assistant';
}

type Message = {
	id: string;
	text: string;
	source: MessageSource;
	timestamp: number;
};

type MessageEvent = {
	message: string;
	source: MessageSource;
};

type ActionResponse = {
	success: boolean;
	messages: Message[];
	checkpointCompleted: boolean;
	nextCheckpoint?: number;
	context?: {
		covered_topics: string[];
		remaining_topics: string[];
		current_depth: number;
		follow_up_questions: string[];
		summary: string;
	};
};

type DBMessage = {
	id: string;
	message: string;
	source: string;
	timestamp: string;
};

type InterviewData = {
	id: string;
	status: string;
	interview_checkpoints: any[];
	messages: DBMessage[];
};

const CHECKPOINTS = [
	{
		id: 1,
		title: 'Project Experience',
		description: 'Recent projects and contributions',
		required_topics: [
			'project overview and scope',
			'personal contribution and role',
			'implementation details',
			'technical decisions made',
			'challenges overcome',
			'team collaboration',
		],
		completion_criteria: {
			min_topics_covered: 5,
			required_depth: 0.8,
		},
	},
	{
		id: 2,
		title: 'Frontend Core',
		description: 'JavaScript and frontend fundamentals',
		required_topics: [
			'javascript threading model',
			'event loop understanding',
			'promises and async',
			'event bubbling',
			'dom manipulation',
			'browser apis',
		],
		completion_criteria: {
			min_topics_covered: 5,
			required_depth: 0.85,
		},
	},
	{
		id: 3,
		title: 'Frontend Frameworks',
		description: 'Framework expertise and styling',
		required_topics: [
			'react experience',
			'state management',
			'component lifecycle',
			'css frameworks comparison',
			'tailwind vs styled-components',
			'performance optimization',
		],
		completion_criteria: {
			min_topics_covered: 5,
			required_depth: 0.8,
		},
	},
	{
		id: 4,
		title: 'Backend & Architecture',
		description: 'Server-side and infrastructure',
		required_topics: [
			'rest architecture',
			'client-server communication',
			'nodejs backend experience',
			'serverless vs traditional',
			'database knowledge',
			'api design patterns',
		],
		completion_criteria: {
			min_topics_covered: 4,
			required_depth: 0.75,
		},
	},
	{
		id: 5,
		title: 'Testing & DevOps',
		description: 'Quality and deployment',
		required_topics: [
			'unit testing approach',
			'testing frameworks',
			'ci/cd pipelines',
			'github actions',
			'docker usage',
			'deployment platforms',
		],
		completion_criteria: {
			min_topics_covered: 4,
			required_depth: 0.75,
		},
	},
];

type LoaderData = {
	signedUrl: string;
	organizationId: string;
	interview: {
		id: string;
		status: string;
		currentCheckpoint: number;
		messages: Message[];
	} | null;
};

interface DynamicVariables {
	user_name: string;
	job: string;
}

export async function loader({ request }: LoaderFunctionArgs) {
	const headers = new Headers();
	const supabase = createSupabaseServer(request, headers);

	const {
		data: { session },
		error,
	} = await supabase.auth.getSession();

	if (!session || error) {
		throw new Response('Unauthorized', { status: 401 });
	}

	// Hardcoded interview ID
	const INTERVIEW_ID = '43ad56de-b836-4fb4-b534-62fbd35e1d60';

	// Get active interview
	const { data: interview } = (await supabase
		.from('interviews')
		.select(`
			*,
			interview_checkpoints(*),
			messages
		`)
		.eq('id', INTERVIEW_ID)
		.single()) as { data: InterviewData | null };

	// Get signed URL from ElevenLabs
	const { ELEVEN_LABS_API_KEY, ELEVEN_LABS_AGENT_ID } = getEnv();

	try {
		const response = await fetch(
			`https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?agent_id=${ELEVEN_LABS_AGENT_ID}`,
			{
				method: 'GET',
				headers: {
					'xi-api-key': ELEVEN_LABS_API_KEY,
				},
			},
		);

		if (!response.ok) {
			throw new Response('Failed to get signed URL from ElevenLabs', {
				status: response.status,
			});
		}

		const body = await response.json();

		return {
			signedUrl: body.signed_url,
			organizationId: 'c949eba5-e3da-41d4-8b93-6ebe7bbf46b0', //hardcoded for now
			interview: interview
				? {
						id: interview.id,
						status: interview.status,
						currentCheckpoint: interview.interview_checkpoints.length,
						messages: (interview.messages || []).map((msg: DBMessage) => ({
							id: msg.id,
							text: msg.message,
							source: normalizeMessageSource(msg.source),
							timestamp: new Date(msg.timestamp).getTime(),
						})),
					}
				: null,
		};
	} catch (error) {
		console.error('Error getting signed URL:', error);
		throw new Response('Failed to get signed URL', { status: 500 });
	}
}

export async function action({ request }: ActionFunctionArgs) {
	const formData = await request.formData();
	const intent = formData.get('intent');
	const interviewId = formData.get('interviewId');

	console.log('intent', intent);

	const headers = new Headers();
	const supabase = createSupabaseServer(request, headers);

	switch (intent) {
		case 'start': {
			const name = formData.get('name');
			const organizationId = formData.get('organizationId');
			const job = formData.get('job');

			const { data: interview, error } = await supabase
				.from('interviews')
				.insert({
					name: `Interview with ${name}`,
					organization_id: organizationId,
					status: 'ready',
					description: `Interview for ${job} position`,
				})
				.select()
				.single();

			if (error) throw new Response('Failed to create interview', { status: 500 });

			// Initialize checkpoints
			await supabase.from('interview_checkpoints').insert(
				CHECKPOINTS.map(checkpoint => ({
					interview_id: interview.id,
					checkpoint_id: checkpoint.id,
					title: checkpoint.title,
					description: checkpoint.description,
				})),
			);

			return { success: true, interviewId: interview.id };
		}

		case 'pause': {
			const { error } = await supabase.from('interviews').update({ status: 'paused' }).eq('id', interviewId);

			if (error) throw new Response('Failed to pause interview', { status: 500 });
			return { success: true };
		}

		case 'resume': {
			const { error } = await supabase.from('interviews').update({ status: 'ready' }).eq('id', interviewId);

			if (error) throw new Response('Failed to resume interview', { status: 500 });
			return { success: true };
		}

		case 'end': {
			const { error } = await supabase.from('interviews').update({ status: 'done' }).eq('id', interviewId);

			if (error) throw new Response('Failed to end interview', { status: 500 });
			return redirect('/protected/interviews');
		}

		case 'saveMessage': {
			const message = formData.get('message');
			const source = normalizeMessageSource(formData.get('source') as string);
			const timestamp = formData.get('timestamp');
			const messageId = formData.get('id');
			const checkpointId = Number(formData.get('checkpointId')) || 1;

			// First save the message
			const { data: messages, error } = await supabase.rpc('append_interview_message', {
				p_interview_id: interviewId,
				p_message: {
					id: messageId,
					message,
					source, // Already normalized
					timestamp: new Date(Number(timestamp)).toISOString(),
				},
			});

			if (error) {
				console.error('Failed to save message:', error);
				throw new Response('Failed to save message', { status: 500 });
			}

			// Only analyze when it's a user message
			if (source === 'user') {
				const currentCheckpoint = CHECKPOINTS[checkpointId - 1];

				if (currentCheckpoint) {
					const result = await analyzeCheckpointCompletion(
						(messages as DBMessage[]).map(msg => ({
							id: msg.id,
							text: msg.message,
							source: msg.source as MessageSource,
							timestamp: new Date(msg.timestamp).getTime(),
						})),
						currentCheckpoint.required_topics,
						currentCheckpoint.completion_criteria.min_topics_covered,
						currentCheckpoint.completion_criteria.required_depth,
					);

					console.log('Analysis result:', result);

					// Update the conversation context with analysis results
					const context = {
						covered_topics: result.covered_topics,
						remaining_topics: currentCheckpoint.required_topics.filter(topic => !result.covered_topics.includes(topic)),
						current_depth: result.confidence_scores.reduce((a, b) => a + b, 0) / result.confidence_scores.length,
						follow_up_questions: result.follow_up_questions,
						summary: result.summary,
					};

					// Check if checkpoint is completed
					const topicsCovered = result.covered_topics.length;
					const averageConfidence =
						result.confidence_scores.reduce((a, b) => a + b, 0) / result.confidence_scores.length;

					if (
						topicsCovered >= currentCheckpoint.completion_criteria.min_topics_covered &&
						averageConfidence >= currentCheckpoint.completion_criteria.required_depth
					) {
						return {
							success: true,
							messages,
							checkpointCompleted: true,
							nextCheckpoint: checkpointId + 1,
							context,
						};
					}

					return {
						success: true,
						messages,
						checkpointCompleted: false,
						context,
					};
				}
			}

			return { success: true, messages, checkpointCompleted: false };
		}

		case 'updateCheckpoint': {
			const checkpointId = formData.get('checkpointId');
			const { error } = await supabase
				.from('interview_checkpoints')
				.update({ completed_at: new Date().toISOString() })
				.eq('interview_id', interviewId)
				.eq('checkpoint_id', checkpointId);

			if (error) throw new Response('Failed to update checkpoint', { status: 500 });
			return { success: true };
		}

		default:
			throw new Response('Invalid action', { status: 400 });
	}
}

export default function AgentRoute() {
	const { signedUrl, interview } = useLoaderData<LoaderData>();
	const submit = useSubmit();
	const [error, setError] = useState<string | null>(null);
	const [messages, setMessages] = useState<Message[]>(interview?.messages || []);
	const [currentCheckpoint, setCurrentCheckpoint] = useState(interview?.currentCheckpoint || 1);
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const [isPaused, setIsPaused] = useState(interview?.status === 'paused');

	// Add dynamic variables state
	const [dynamicVariables] = useState<DynamicVariables>({
		user_name: 'Robert',
		job: 'Software Engineer',
	});

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	};

	useEffect(() => {
		scrollToBottom();
	}, [messages]);

	const saveMessage = async (message: Message): Promise<ActionResponse> => {
		const formData = new FormData();
		formData.append('intent', 'saveMessage');
		formData.append('interviewId', '43ad56de-b836-4fb4-b534-62fbd35e1d60');
		formData.append('id', message.id);
		formData.append('message', message.text);
		formData.append('source', message.source);
		formData.append('timestamp', message.timestamp.toString());
		formData.append('checkpointId', currentCheckpoint.toString());

		const response = await submit(formData, { method: 'post' });
		return response as unknown as ActionResponse;
	};

	const conversation = useConversation({
		signedUrl,
		dynamicVariables,
		options: {
			keepAlive: true,
			reconnect: true,
			reconnectAttempts: 3,
			timeout: 30000,
		},
		initialContext: {
			context: {
				user_name: dynamicVariables.user_name,
				job: dynamicVariables.job,
				checkpoints: CHECKPOINTS.map(checkpoint => ({
					id: checkpoint.id,
					title: checkpoint.title,
					description: checkpoint.description,
					required_topics: checkpoint.required_topics,
					completion_criteria: checkpoint.completion_criteria,
				})),
				current_checkpoint: currentCheckpoint,
			},
		},
		onMessage: async ({ message, source }: MessageEvent) => {
			const newMessage = {
				id: crypto.randomUUID(),
				text: message,
				source,
				timestamp: Date.now(),
			};

			setMessages(prev => [...prev, newMessage]);
			const result = await saveMessage(newMessage);

			// Update checkpoint if completed
			if (result.checkpointCompleted) {
				setCurrentCheckpoint(result.nextCheckpoint!);
			}
		},
		onError: (err: Error) => {
			const errorMessage = `Conversation error: ${err.message}`;
			console.error(errorMessage, err);
			setError(errorMessage);
			setIsPaused(true);
		},
		onStatusChange: (status: string) => {
			console.log('Status changed to:', status);
			if (status === 'disconnected') {
				console.log('Connection lost - waiting for potential reconnection');
			}
		},
		onReconnecting: () => {
			console.log('Attempting to reconnect...');
		},
		onReconnected: () => {
			console.log('Successfully reconnected');
			setIsPaused(false);
			setError(null);
		},
		onReconnectFailed: () => {
			console.log('Reconnection failed - ending session');
			setIsPaused(true);
			setError('Connection lost - please try starting the session again');
		},
	});

	const isConnecting = conversation.status === 'connecting';
	const isConnected = conversation.status === 'connected';

	const handleStartSession = async () => {
		try {
			setError(null);
			setIsPaused(false);
			await conversation.startSession({
				context: {
					user_name: dynamicVariables.user_name,
					job: dynamicVariables.job,
				},
			});
		} catch (err) {
			console.error('Failed to start session:', err);
			setError('Failed to start conversation');
			setIsPaused(true);
		}
	};

	const handlePauseResume = async () => {
		if (!interview?.id) return;

		try {
			if (isPaused) {
				setError(null);
				setIsPaused(false);
				submit(
					{
						intent: 'resume',
						interviewId: interview.id,
					},
					{ method: 'post' },
				);
				await conversation.startSession({
					context: {
						user_name: dynamicVariables.user_name,
						job: dynamicVariables.job,
					},
				});
			} else {
				setIsPaused(true);
				submit(
					{
						intent: 'pause',
						interviewId: interview.id,
					},
					{ method: 'post' },
				);
				await conversation.endSession();
			}
		} catch (err) {
			console.error('Failed to pause/resume:', err);
			setError('Failed to pause/resume conversation');
		}
	};

	const handleEndSession = async () => {
		if (!interview?.id) return;

		try {
			setIsPaused(false);
			setMessages([]);
			submit(
				{
					intent: 'end',
					interviewId: interview.id,
				},
				{ method: 'post' },
			);
			await conversation.endSession();
		} catch (err) {
			console.error('Failed to end session:', err);
			setError('Failed to end conversation');
		}
	};

	return (
		<div className="flex min-h-screen bg-white">
			{/* Left sidebar with checkpoints */}
			<div className="w-80 border-r bg-white p-6 hidden md:block">
				<h2 className="text-xl font-semibold mb-6 text-brand-primary">Interview Progress</h2>
				<div className="space-y-8">
					{CHECKPOINTS.map(checkpoint => (
						<div
							key={checkpoint.id}
							className={cn(
								'flex items-start gap-4 transition-all duration-300',
								checkpoint.id <= currentCheckpoint ? 'opacity-100' : 'opacity-50',
							)}
						>
							{checkpoint.id <= currentCheckpoint ? (
								<CheckCircle2 className="w-6 h-6 text-brand-primary mt-1" />
							) : (
								<Circle className="w-6 h-6 text-brand-secondary mt-1" />
							)}
							<div>
								<h3
									className={`font-medium ${checkpoint.id <= currentCheckpoint ? 'text-brand-primary' : 'text-brand-secondary'}`}
								>
									{checkpoint.title}
								</h3>
								<p className="text-sm text-gray-500">{checkpoint.description}</p>
							</div>
						</div>
					))}
				</div>

				{/* Progress bar */}
				<div className="mt-8">
					<div className="flex justify-between text-sm text-brand-secondary mb-2">
						<span>Overall Progress</span>
						<span>{Math.round((currentCheckpoint / CHECKPOINTS.length) * 100)}%</span>
					</div>
					<div className="h-2 bg-brand-neutral rounded-full">
						<div
							className="h-full bg-brand-primary rounded-full transition-all duration-500"
							style={{ width: `${(currentCheckpoint / CHECKPOINTS.length) * 100}%` }}
						/>
					</div>
				</div>
			</div>

			{/* Main chat area */}
			<div className="flex-1 flex flex-col p-6">
				<Card className="bg-gradient-to-br from-[#FFE5A3]/20 to-[#FFD166]/20 backdrop-blur-sm border-none shadow-lg p-6 relative overflow-hidden">
					<div className="absolute inset-0">
						<div className="absolute inset-0 bg-gradient-to-r from-[#FFE5A3] to-[#FFD166] opacity-10" />
						{/* Friendly background elements */}
						{['🌟', '✨', '💫'].map((emoji, i) => (
							<div
								key={i}
								className="absolute text-2xl opacity-20"
								style={{
									top: `${25 + i * 30}%`,
									left: `${20 + i * 30}%`,
									animation: 'float 3s ease-in-out infinite',
									animationDelay: `${i * 0.5}s`,
								}}
							>
								{emoji}
							</div>
						))}
					</div>
					<style>{`
              @keyframes float {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-10px); }
              }
            `}</style>
					<div className="relative w-full h-[400px]">
						<LottieAvatar isSpeaking={conversation.isSpeaking} />
					</div>
				</Card>
				<div className="flex-1 bg-white backdrop-blur-sm border-none shadow-lg p-8 mb-6 overflow-hidden flex flex-col rounded-lg">
					<div className="flex-1 overflow-y-auto pr-4 space-y-6">
						{messages.length === 0 ? (
							<div className="h-full flex items-center justify-center text-brand-secondary">
								Start the conversation to begin your screening
							</div>
						) : (
							messages.map(message => (
								<div
									key={message.id}
									className={cn(
										'flex items-start gap-4 max-w-2xl mx-auto',
										message.source === 'user' ? 'flex-row-reverse' : '',
									)}
								>
									<div
										className={cn(
											'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-white',
											message.source === 'user' ? 'bg-brand-primary' : 'bg-brand-accent',
										)}
									>
										{message.source === 'user' ? 'You' : 'AI'}
									</div>
									<div
										className={cn(
											'flex-1 rounded-2xl p-4 transition-all duration-300',
											message.source === 'user' ? 'bg-brand-primary text-white' : 'bg-brand-neutral text-brand-primary',
										)}
									>
										{message.text}
									</div>
								</div>
							))
						)}
						<div ref={messagesEndRef} />
					</div>

					{/* Status and Error Display */}
					<div className="mb-4 space-y-2">
						{error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>}
						{conversation.isSpeaking && (
							<div className="bg-brand-neutral border border-brand-secondary text-brand-primary px-4 py-2 rounded">
								Speaking...
							</div>
						)}
					</div>
				</div>

				{/* Control buttons */}
				<div className="max-w-2xl mx-auto w-full flex gap-4">
					{!isConnected ? (
						<button
							onClick={handleStartSession}
							disabled={isConnecting}
							className={cn(
								'w-full flex gap-2 items-center justify-center py-2 px-4 rounded-lg text-white',
								isConnecting ? 'bg-brand-secondary cursor-not-allowed' : 'bg-brand-primary hover:bg-brand-secondary',
							)}
						>
							<Play className="w-4 h-4" />
							{isConnecting ? 'Connecting...' : 'Start Interview'}
						</button>
					) : (
						<>
							<button
								onClick={handlePauseResume}
								className="w-full border border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white flex gap-2 items-center justify-center py-2 px-4 rounded-lg"
							>
								{isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
								{isPaused ? 'Resume Interview' : 'Pause Interview'}
							</button>
							<button
								onClick={handleEndSession}
								className="w-full bg-red-500 hover:bg-red-700 text-white flex gap-2 items-center justify-center py-2 px-4 rounded-lg"
							>
								<X className="w-4 h-4" />
								End Interview
							</button>
						</>
					)}
				</div>
			</div>
		</div>
	);
}
