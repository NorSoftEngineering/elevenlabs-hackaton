import OpenAI from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

type Message = {
	id: string;
	text: string;
	source: string;
	timestamp: number;
};

type AnalysisResult = {
	checkpointCompleted: boolean;
	score: number;
	feedback: {
		covered: string[];
		missing: string[];
		suggestions: string[];
	};
	confidence: number;
};

type Checkpoint = {
	id: number;
	title: string;
	description: string;
};

const openai = new OpenAI({
	apiKey: process.env.GROQ_API_KEY,
	baseURL: 'https://api.groq.com/openai/v1',
});

// Helper to ensure valid OpenAI roles
function mapSourceToRole(source: string): 'user' | 'assistant' {
	// Map any variations to valid OpenAI roles
	if (source === 'user') return 'user';
	// Map 'ai' or any other source to 'assistant'
	return 'assistant';
}

// Simplified checkpoint criteria
const CHECKPOINT_CRITERIA = {
	1: {
		// Project Experience
		minScore: 0.6,
		keyAreas: ['Project description and purpose', 'Technologies used', 'Personal contribution'],
	},
	2: {
		// Frontend Core
		minScore: 0.6,
		keyAreas: ['JavaScript knowledge', 'Frontend fundamentals', 'Problem-solving approach'],
	},
	3: {
		// Frontend Frameworks
		minScore: 0.6,
		keyAreas: ['React experience', 'State and data flow', 'UI/UX implementation'],
	},
	4: {
		// Backend & Architecture
		minScore: 0.6,
		keyAreas: ['Backend development', 'Database knowledge', 'System architecture'],
	},
	5: {
		// Testing & DevOps
		minScore: 0.6,
		keyAreas: ['Testing approach', 'Deployment process', 'Quality assurance'],
	},
};

export async function analyzeCheckpointCompletion(
	messages: Message[],
	options: {
		checkpointId: number;
		checkpoint: Checkpoint;
	},
): Promise<AnalysisResult> {
	const conversation: ChatCompletionMessageParam[] = messages.map(msg => ({
		role: mapSourceToRole(msg.source),
		content: msg.text,
	}));

	const validConversation = conversation.filter(
		msg => msg.content && typeof msg.content === 'string' && msg.content.trim().length > 0,
	);

	const criteria = CHECKPOINT_CRITERIA[options.checkpointId as keyof typeof CHECKPOINT_CRITERIA];

	const systemPrompt = `You are analyzing a technical interview conversation.
Your task is to evaluate the candidate's responses for the current checkpoint.

Current Checkpoint: ${options.checkpoint.title}
Description: ${options.checkpoint.description}

Key Areas to Evaluate:
${criteria.keyAreas.map(area => `- ${area}`).join('\n')}

For each key area, consider:
1. Did the candidate address this area?
2. Did they show practical understanding?
3. Was the discussion meaningful and detailed?

Score the conversation from 0 to 1:
0.0-0.3: Minimal/No discussion
0.4-0.6: Basic discussion
0.7-1.0: Thorough discussion

A checkpoint is considered completed if:
1. The overall discussion score is >= ${criteria.minScore}
2. The candidate showed practical understanding
3. The responses were clear and detailed`;

	try {
		const response = await openai.chat.completions.create({
			model: 'llama-3.1-8b-instant',
			messages: [
				{
					role: 'system',
					content: systemPrompt,
				},
				...validConversation,
				{
					role: 'system',
					content: `Analyze the conversation and provide a simple evaluation.

Format your response as a JSON object with:
{
  "checkpointCompleted": boolean,
  "score": number,
  "feedback": {
    "covered": string[],
    "missing": string[],
    "suggestions": string[]
  },
  "confidence": number
}`,
				},
			],
			response_format: { type: 'json_object' },
			temperature: 0.1,
			max_tokens: 1000,
		});

		if (!response.choices[0].message.content) {
			throw new Error('No analysis result received');
		}

		const result = JSON.parse(response.choices[0].message.content) as AnalysisResult;

		return {
			checkpointCompleted: result.score >= criteria.minScore,
			score: result.score,
			feedback: result.feedback,
			confidence: result.confidence,
		};
	} catch (error) {
		console.error('OpenAI API error:', error);
		throw new Error('Failed to analyze interview content');
	}
}
