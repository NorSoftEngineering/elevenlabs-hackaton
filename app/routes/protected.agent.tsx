import { Form, redirect, useLoaderData, useNavigation, useSubmit, useActionData } from 'react-router';

import { useConversation } from '@11labs/react';
import { CheckCircle2, Circle, Mic, Pause, Play, Send, Volume2, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router';
import { LottieAvatar } from '~/components/LottieAvatar';
import { Card } from '~/components/ui/card';
import { cn } from '~/lib/utils';
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
	source: string;
	timestamp: number;
};

type MessageEvent = {
	message: string;
	source: MessageSource;
};

type DBMessage = {
	id: string;
	message: string;
	source: string;
	timestamp: string;
};

type Agent = {
	agent_id: string;
	name: string;
};

type CheckpointAnalysis = {
	summary: string;
	score: number;
	feedback: {
		covered: string[];
		missing: string[];
		suggestions: string[];
	};
	confidence: number;
};

type Interview = {
	id: string;
	status: string;
	currentCheckpoint: number;
	messages: Message[];
	interview_checkpoints: {
		id: string;
		checkpoint_id: number;
		completed_at: string | null;
		analysis?: CheckpointAnalysis;
	}[];
};

type InterviewData = {
	id: string;
	status: string;
	interview_checkpoints: {
		id: string;
		checkpoint_id: number;
		completed_at: string | null;
		analysis?: CheckpointAnalysis;
	}[];
	messages: DBMessage[];
};

const CHECKPOINTS = [
	{
		id: 1,
		title: 'Project Experience',
		description: 'Recent projects and contributions',
	},
	{
		id: 2,
		title: 'Frontend Core',
		description: 'JavaScript and frontend fundamentals',
	},
	{
		id: 3,
		title: 'Frontend Frameworks',
		description: 'Framework expertise and styling',
	},
	{
		id: 4,
		title: 'Backend & Architecture',
		description: 'Server-side and infrastructure',
	},
	{
		id: 5,
		title: 'Testing & DevOps',
		description: 'Quality and deployment',
	},
];

type LoaderData = {
	interview: Interview | null;
	agents: Agent[];
	selectedAgentId: string | null;
};

export async function loader({ request }: LoaderFunctionArgs) {
	const supabase = createSupabaseServer(request, new Headers());

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

	const AGENTS = [
		{
			agent_id: 'Zpp6J4Xq3NpEhs266fpy',
			name: 'Hope Female American',
		},
		{
			agent_id: 'ybrNX1zWwwqwgMAGc0lm',
			name: 'Eric Male Laidback American',
		},
	];

	return {
		agents: AGENTS,
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
					interview_checkpoints: interview.interview_checkpoints.map((cp: any) => ({
						id: cp.id,
						checkpoint_id: cp.checkpoint_id,
						completed_at: cp.completed_at,
						analysis: cp.analysis,
					})),
				}
			: null,
	};
}

export async function action({ request }: ActionFunctionArgs) {
	const formData = await request.formData();
	const intent = formData.get('intent');
	const interviewId = formData.get('interviewId');

	const supabase = createSupabaseServer(request, new Headers());

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
					covered_topics: [], // Initialize with empty array (non-null)
					created_at: new Date().toISOString(),
					updated_at: new Date().toISOString(),
				})),
			);

			return { success: true, interviewId: interview.id };
		}

		case 'end': {
			// Update interview status to done
			const { error: updateError } = await supabase.from('interviews').update({ status: 'done' }).eq('id', interviewId);

			if (updateError) {
				console.error('Failed to end interview:', updateError);
				throw new Response('Failed to end interview', { status: 500 });
			}

			// Call the webhook with the interview ID
			try {
				const webhookUrl = new URL('https://hook.eu2.make.com/hlpslpduawqueyo9m5nl1fdxsbq1lbs6');
				webhookUrl.searchParams.append('interviewId', interviewId as string);

				const webhookResponse = await fetch(webhookUrl.toString());
				if (!webhookResponse.ok) {
					console.error('Webhook call failed:', await webhookResponse.text());
					// We don't throw here as the interview is already ended
				}
			} catch (webhookError) {
				console.error('Failed to call webhook:', webhookError);
				// We don't throw here as the interview is already ended
			}

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
					source,
					timestamp: new Date(Number(timestamp)).toISOString(),
				},
			});

			if (error) {
				console.error('Failed to save message:', error);
				throw new Response('Failed to save message', { status: 500 });
			}

			// Only analyze when it's a user message
			if (source === 'user') {
				const result = await analyzeCheckpointCompletion(
					(messages as DBMessage[]).map(msg => ({
						id: msg.id,
						text: msg.message,
						source: normalizeMessageSource(msg.source),
						timestamp: new Date(msg.timestamp).getTime(),
					})),
					{
						checkpointId,
						checkpoint: CHECKPOINTS[checkpointId - 1],
					},
				);

				if (result.checkpointCompleted) {
					// Update the checkpoint directly here instead of submitting a new form
					const { error: checkpointError } = await supabase.from('interview_checkpoints').upsert({
						interview_id: interviewId,
						checkpoint_id: checkpointId,
						completed_at: new Date().toISOString(),
						updated_at: new Date().toISOString(),
						analysis: {
							score: result.score,
							feedback: result.feedback,
							confidence: result.confidence,
						},
					});

					if (checkpointError) {
						console.error('Failed to update checkpoint:', checkpointError);
						throw new Response('Failed to update checkpoint', { status: 500 });
					}

					return {
						success: true,
						messages: (messages as DBMessage[]).map(msg => ({
							id: msg.id,
							text: msg.message,
							source: normalizeMessageSource(msg.source),
							timestamp: new Date(msg.timestamp).getTime(),
						})),
						checkpointCompleted: true,
						nextCheckpoint: checkpointId + 1,
						analysis: {
							score: result.score,
							feedback: result.feedback,
							confidence: result.confidence,
						},
					};
				}

				return {
					success: true,
					messages: (messages as DBMessage[]).map(msg => ({
						id: msg.id,
						text: msg.message,
						source: normalizeMessageSource(msg.source),
						timestamp: new Date(msg.timestamp).getTime(),
					})),
					checkpointCompleted: false,
					analysis: {
						score: result.score,
						feedback: result.feedback,
						confidence: result.confidence,
					},
				};
			}

			return {
				success: true,
				messages: (messages as DBMessage[]).map(msg => ({
					id: msg.id,
					text: msg.message,
					source: normalizeMessageSource(msg.source),
					timestamp: new Date(msg.timestamp).getTime(),
				})),
				checkpointCompleted: false,
			};
		}

		case 'updateCheckpoint': {
			const checkpointId = formData.get('checkpointId');
			const analysis = formData.get('analysis');

			const { error } = await supabase.from('interview_checkpoints').insert({
				completed_at: new Date().toISOString(),
				updated_at: new Date().toISOString(),
				analysis: analysis ? JSON.parse(analysis as string) : null,
				interview_id: interviewId,
				id: checkpointId,
			});

			if (error) throw new Response('Failed to update checkpoint', { status: 500 });
			return { success: true };
		}

		default:
			throw new Response('Invalid action', { status: 400 });
	}
}

export default function AgentRoute() {
	const { interview, agents } = useLoaderData<LoaderData>();
	const actionData = useActionData<typeof action>();
	const submit = useSubmit();
	const navigation = useNavigation();
	const [error, setError] = useState<string | null>(null);
	const [messages, setMessages] = useState<Message[]>(interview?.messages || []);
	const [currentCheckpoint, setCurrentCheckpoint] = useState(interview?.currentCheckpoint || 1);
	const [currentAgentId, setCurrentAgentId] = useState(agents[0].agent_id);
	const messagesEndRef = useRef<HTMLDivElement>(null);

	// Effect to handle action data updates
	useEffect(() => {
		if (actionData?.success && actionData.selectedAgentId) {
			// Restart conversation with new agent
			if (conversation.status === 'connected') {
				conversation
					.endSession()
					.then(() => {
						handleStartSession();
					})
					.catch(err => {
						console.error('Failed to switch agent:', err);
						setError('Failed to switch agent');
					});
			}
		}
	}, [actionData]);

	const saveMessage = async (message: Message) => {
		const formData = new FormData();
		formData.append('intent', 'saveMessage');
		formData.append('interviewId', '43ad56de-b836-4fb4-b534-62fbd35e1d60');
		formData.append('id', message.id);
		formData.append('message', message.text);
		formData.append('source', message.source);
		formData.append('timestamp', message.timestamp.toString());
		formData.append('checkpointId', currentCheckpoint.toString());

		try {
			// Optimistically add the message to the UI
			setMessages(prev => [...prev, message]);

			// Submit the form and let the loader handle the response
			submit(formData, { method: 'post' });
		} catch (err) {
			console.error('Failed to save message:', err);
			setError('Failed to save message');
			// Remove the optimistically added message on error
			setMessages(prev => prev.filter(m => m.id !== message.id));
		}
	};

	const conversation = useConversation({
		agentId: currentAgentId,
		dynamicVariables: {
			user_name: 'Robert',
			job: 'Software Engineer',
		},
		options: {
			keepAlive: true,
			reconnect: true,
			reconnectAttempts: 3,
			timeout: 30000,
		},
		initialContext: {
			context: {
				user_name: 'Robert',
				job: 'Software Engineer',
				checkpoints: CHECKPOINTS.map(checkpoint => ({
					id: checkpoint.id,
					title: checkpoint.title,
					description: checkpoint.description,
				})),
				current_checkpoint: currentCheckpoint,
			},
		},
		onMessage: async ({ message, source }: MessageEvent) => {
			try {
				const newMessage = {
					id: crypto.randomUUID(),
					text: message,
					source,
					timestamp: Date.now(),
				};

				await saveMessage(newMessage);
			} catch (err) {
				console.error('Error in onMessage handler:', err);
				setError('Failed to process message');
			}
		},
		onStartSpeaking: () => {
			console.log('Started speaking');
		},
		onStopSpeaking: () => {
			console.log('Stopped speaking');
		},
		onError: (err: Error) => {
			const errorMessage = `Conversation error: ${err.message}`;
			console.error(errorMessage, err);
			setError(errorMessage);
		},
		onStatusChange: (status: string) => {
			console.log('Status changed to:', status);
		},
		onReconnecting: () => {
			console.log('Attempting to reconnect...');
		},
		onReconnected: () => {
			console.log('Successfully reconnected');
			setError(null);
		},
		onReconnectFailed: () => {
			console.log('Reconnection failed - ending session');
			setError('Connection lost - please try starting the session again');
		},
	});

	const isConnecting = conversation.status === 'connecting';
	const isConnected = conversation.status === 'connected';

	const handleStartSession = async () => {
		try {
			setError(null);
			await conversation.startSession({
				context: {
					user_name: 'Robert',
					job: 'Software Engineer',
				},
			});
		} catch (err) {
			console.error('Failed to start session:', err);
			setError('Failed to start conversation');
		}
	};

	const handleEndSession = async () => {
		if (!interview?.id) return;

		try {
			await conversation.endSession();

			// Clean up UI state
			setMessages([]);

			// Submit the end action with the interview ID
			submit(
				{
					intent: 'end',
					interviewId: interview.id,
				},
				{ method: 'post' },
			);
		} catch (err) {
			console.error('Failed to end session:', err);
			setError('Failed to end conversation');
		}
	};

	const handleAgentChange = async (newAgentId: string) => {
		if (conversation.status === 'connected') {
			return null;
		}
		setCurrentAgentId(newAgentId);
	};

	return (
		<div className="flex min-h-screen bg-white relative">
			{/* Main chat area */}
			<div className="flex-1 flex flex-col p-6 md:pr-[20rem] relative">
				{/* Sticky Avatar Card */}
				<div className="sticky top-0 z-10 bg-white pb-6">
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
							@keyframes pulse {
								0%, 100% { opacity: 1; transform: scale(1); }
								50% { opacity: 0.5; transform: scale(0.95); }
							}
							@keyframes wave {
								0% { transform: scaleY(1); }
								50% { transform: scaleY(0.5); }
								100% { transform: scaleY(1); }
							}
						`}</style>
						<div className="relative w-full h-[400px]">
							<LottieAvatar isSpeaking={conversation.isSpeaking} />
							{/* Status Indicator */}
							<div className="absolute top-4 right-4 flex items-center gap-2">
								<div
									className={cn(
										'px-4 py-2 rounded-full flex items-center gap-2 text-sm font-medium transition-all duration-300',
										!isConnected
											? 'bg-brand-neutral text-brand-secondary border border-brand-secondary'
											: conversation.isSpeaking
												? 'bg-brand-primary text-white'
												: 'bg-brand-neutral text-brand-primary border border-brand-primary',
									)}
								>
									{!isConnected ? (
										<>
											<Circle className="w-4 h-4" />
											Ready to Start
										</>
									) : conversation.isSpeaking ? (
										<>
											<div className="flex items-center gap-1">
												<div
													className="w-0.5 h-3 bg-white animate-[wave_1s_ease-in-out_infinite]"
													style={{ animationDelay: '0s' }}
												/>
												<div
													className="w-0.5 h-3 bg-white animate-[wave_1s_ease-in-out_infinite]"
													style={{ animationDelay: '0.2s' }}
												/>
												<div
													className="w-0.5 h-3 bg-white animate-[wave_1s_ease-in-out_infinite]"
													style={{ animationDelay: '0.4s' }}
												/>
											</div>
											<Volume2 className="w-4 h-4 animate-[pulse_2s_ease-in-out_infinite]" />
											Speaking
										</>
									) : (
										<>
											<Mic className="w-4 h-4 animate-[pulse_2s_ease-in-out_infinite]" />
											Listening
										</>
									)}
								</div>
							</div>

							{/* Agent Selection and Control Buttons */}
							<div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 w-full max-w-md">
								{!isConnected && (
									<select
										value={currentAgentId}
										onChange={e => handleAgentChange(e.target.value)}
										disabled={isConnected}
										className="w-full px-4 py-2 rounded-lg border border-brand-primary bg-white text-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/50 disabled:opacity-50"
									>
										{agents.map(agent => (
											<option key={agent.agent_id} value={agent.agent_id}>
												{agent.name}
											</option>
										))}
									</select>
								)}

								{!isConnected ? (
									<button
										onClick={handleStartSession}
										disabled={isConnecting || navigation.state === 'submitting'}
										className={cn(
											'w-full flex gap-2 items-center justify-center py-2 px-4 rounded-lg text-white',
											isConnecting || navigation.state === 'submitting'
												? 'bg-brand-secondary cursor-not-allowed'
												: 'bg-brand-primary hover:bg-brand-secondary',
										)}
									>
										<Play className="w-4 h-4" />
										{isConnecting
											? 'Connecting...'
											: navigation.state === 'submitting'
												? 'Switching Agent...'
												: 'Start Interview'}
									</button>
								) : (
									<button
										onClick={handleEndSession}
										className="w-full bg-red-500 hover:bg-red-700 text-white flex gap-2 items-center justify-center py-2 px-4 rounded-lg"
									>
										<X className="w-4 h-4" />
										End Interview
									</button>
								)}
							</div>
						</div>
					</Card>
				</div>

				{/* Messages Container - adjust margin to account for sticky header */}
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
					</div>
				</div>
			</div>

			{/* Checkpoint sidebar - now with detailed feedback */}
			<div className="fixed bottom-0 right-0 w-80 bg-white border-l p-6 hidden md:block h-[80vh] overflow-y-auto">
				<h2 className="text-xl font-semibold mb-6 text-brand-primary sticky top-0 bg-white pb-4 border-b">
					Interview Progress
				</h2>
				<div className="space-y-6">
					{CHECKPOINTS.map(checkpoint => {
						const isActive = checkpoint.id === currentCheckpoint;
						const isCompleted = checkpoint.id < currentCheckpoint;
						const checkpointData = interview?.interview_checkpoints.find(cp => cp.checkpoint_id === checkpoint.id);
						const analysis = checkpointData?.analysis;

						return (
							<div
								key={checkpoint.id}
								className={cn(
									'transition-all duration-300',
									checkpoint.id <= currentCheckpoint ? 'opacity-100' : 'opacity-50',
								)}
							>
								<div className="flex items-start gap-4">
									{isCompleted ? (
										<CheckCircle2 className="w-6 h-6 text-brand-primary mt-1" />
									) : isActive ? (
										<Circle className="w-6 h-6 text-brand-primary mt-1 animate-pulse" />
									) : (
										<Circle className="w-6 h-6 text-brand-secondary mt-1" />
									)}
									<div className="flex-1">
										<h3
											className={cn(
												'font-medium',
												isActive ? 'text-brand-primary' : isCompleted ? 'text-brand-primary' : 'text-brand-secondary',
											)}
										>
											{checkpoint.title}
										</h3>
										<p className="text-sm text-gray-500">{checkpoint.description}</p>

										{/* Analysis Feedback */}
										{analysis && (
											<div className="mt-2 text-sm">
												<div className="flex items-center gap-2 mb-1">
													<div className="h-2 flex-1 bg-gray-200 rounded-full overflow-hidden">
														<div
															className={cn(
																'h-full rounded-full',
																analysis.score >= 0.7
																	? 'bg-green-500'
																	: analysis.score >= 0.4
																		? 'bg-yellow-500'
																		: 'bg-red-500',
															)}
															style={{ width: `${analysis.score * 100}%` }}
														/>
													</div>
													<span className="text-xs text-gray-600">{Math.round(analysis.score * 100)}%</span>
												</div>

												{analysis.feedback.covered.length > 0 && (
													<div className="mb-1 text-green-600">
														<span className="font-medium">Covered:</span>
														<ul className="list-disc list-inside">
															{analysis.feedback.covered.map((item: string, i: number) => (
																<li key={i} className="text-xs">
																	{item}
																</li>
															))}
														</ul>
													</div>
												)}

												{analysis.feedback.missing.length > 0 && (
													<div className="mb-1 text-red-600">
														<span className="font-medium">Missing:</span>
														<ul className="list-disc list-inside">
															{analysis.feedback.missing.map((item: string, i: number) => (
																<li key={i} className="text-xs">
																	{item}
																</li>
															))}
														</ul>
													</div>
												)}

												{isActive && analysis.feedback.suggestions.length > 0 && (
													<div className="text-blue-600">
														<span className="font-medium">Suggestions:</span>
														<ul className="list-disc list-inside">
															{analysis.feedback.suggestions.map((item: string, i: number) => (
																<li key={i} className="text-xs">
																	{item}
																</li>
															))}
														</ul>
													</div>
												)}
											</div>
										)}
									</div>
								</div>
							</div>
						);
					})}
				</div>

				{/* Progress Indicator */}
				<div className="sticky bottom-0 mt-8 text-center text-brand-secondary bg-white pt-4 border-t">
					<p className="text-sm">
						Checkpoint {currentCheckpoint} of {CHECKPOINTS.length}
					</p>
				</div>
			</div>
		</div>
	);
}
