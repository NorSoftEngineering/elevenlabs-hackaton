import OpenAI from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

type Message = {
	id: string;
	text: string;
	source: 'user' | 'assistant';
	timestamp: number;
};

type AnalysisResult = {
	covered_topics: string[];
	summary: string;
	follow_up_questions: string[];
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

export async function analyzeCheckpointCompletion(
	messages: Message[],
	topics: string[],
	requiredTopics: number,
): Promise<AnalysisResult> {
	// Convert messages to a structured conversation format with valid OpenAI roles
	const conversation: ChatCompletionMessageParam[] = messages.map(msg => ({
		role: mapSourceToRole(msg.source),
		content: msg.text,
	}));

	// Filter out any empty or invalid messages
	const validConversation = conversation.filter(
		msg => msg.content && typeof msg.content === 'string' && msg.content.trim().length > 0,
	);

	console.log('Processed conversation for analysis:', validConversation);

	const systemPrompt = `You are analyzing a technical interview conversation.
Your task is to track which topics have been meaningfully discussed.

Topics to track: ${topics.join(', ')}
Required topics to cover: ${requiredTopics}

A topic is considered covered if:
1. The candidate has provided a clear response about it
2. There was meaningful discussion (not just a mention)
3. The candidate showed practical understanding

Your job is to:
1. Track which topics were covered in the conversation
2. Provide a brief summary of what was discussed
3. Suggest follow-up questions for uncovered topics

Please focus on:
- Identifying clear topic coverage
- Tracking conversation progress
- Noting areas that need more discussion`;

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
					content: `Please analyze the conversation and provide:
1. Which topics were meaningfully covered
2. Brief summary of the discussion
3. Suggested follow-up questions for uncovered topics

Format your response as a JSON object with:
{
  "covered_topics": string[],
  "summary": string,
  "follow_up_questions": string[]
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

		console.log('Raw OpenAI response:', response.choices[0].message.content);
		console.log('Parsed result:', result);

		// Validate and clean up the result
		const validatedResult = {
			covered_topics: Array.isArray(result.covered_topics) ? result.covered_topics : [],
			summary: result.summary || 'No summary provided',
			follow_up_questions: Array.isArray(result.follow_up_questions) ? result.follow_up_questions : [],
		};

		console.log('Validated result:', validatedResult);
		return validatedResult;
	} catch (error) {
		console.error('OpenAI API error:', error);
		throw new Error('Failed to analyze interview content');
	}
}
