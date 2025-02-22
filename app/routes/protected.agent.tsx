import { useLoaderData } from 'react-router';
import { createSupabaseServer } from '~/utils/supabase.server';
import { getEnv } from '~/utils/env.server';
import { useConversation } from '@11labs/react';
import { useState, useRef, useEffect } from 'react';

type MessageSource = 'user' | 'assistant';

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

type LoaderData = {
	signedUrl: string;
};

export async function loader({ request }: { request: Request }) {
	const headers = new Headers();
	const supabase = createSupabaseServer(request, headers);

	const {
		data: { session },
		error,
	} = await supabase.auth.getSession();

	if (!session || error) {
		throw new Response('Unauthorized', { status: 401 });
	}

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
		};
	} catch (error) {
		console.error('Error getting signed URL:', error);
		throw new Response('Failed to get signed URL', { status: 500 });
	}
}

export default function AgentRoute() {
	const { signedUrl } = useLoaderData<LoaderData>();
	const [error, setError] = useState<string | null>(null);
	const [messages, setMessages] = useState<Message[]>([]);
	const messagesEndRef = useRef<HTMLDivElement>(null);

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	};

	useEffect(() => {
		scrollToBottom();
	}, [messages]);

	const conversation = useConversation({
		signedUrl,
		onMessage: ({ message, source }: MessageEvent) => {
			setMessages(prev => [
				...prev,
				{
					id: crypto.randomUUID(),
					text: message,
					source,
					timestamp: Date.now(),
				},
			]);
		},
		onError: (err: Error) => {
			console.error('Conversation error:', err);
			setError('Conversation error occurred');
		},
	});

	const isConnecting = conversation.status === 'connecting';
	const isConnected = conversation.status === 'connected';

	return (
		<div className="container mx-auto px-4 py-8">
			<h1 className="text-3xl font-bold mb-8">AI Agent Interface</h1>

			<div className="bg-white rounded-lg shadow-md p-6">
				{/* Messages Area */}
				<div className="mb-6 h-[400px] overflow-y-auto border border-gray-200 rounded-lg p-4">
					{messages.length === 0 ? (
						<div className="text-gray-500 text-center py-4">No messages yet. Start a conversation to begin.</div>
					) : (
						<div className="space-y-4">
							{messages.map(message => (
								<div key={message.id} className={`flex ${message.source === 'user' ? 'justify-end' : 'justify-start'}`}>
									<div
										className={`max-w-[70%] rounded-lg p-3 ${
											message.source === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-800'
										}`}
									>
										{message.text}
									</div>
								</div>
							))}
							<div ref={messagesEndRef} />
						</div>
					)}
				</div>

				{/* Status and Error Display */}
				<div className="mb-4 space-y-2">
					{error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>}
					{conversation.isSpeaking && (
						<div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-2 rounded">Speaking...</div>
					)}
				</div>

				{/* Control Buttons */}
				<div className="flex space-x-4">
					{!isConnected ? (
						<button
							onClick={() => conversation.startSession()}
							disabled={isConnecting}
							className={`flex-1 ${
								isConnecting ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-700'
							} text-white font-bold py-2 px-4 rounded`}
						>
							{isConnecting ? 'Starting...' : 'Start Conversation'}
						</button>
					) : (
						<button
							onClick={() => conversation.endSession()}
							className="flex-1 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
						>
							End Conversation
						</button>
					)}
				</div>
			</div>
		</div>
	);
}
