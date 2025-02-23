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
	confidence_scores: number[];
	summary: string;
	follow_up_questions: string[];
};

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
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
	requiredTopics: string[],
	minTopicsCovered: number,
	requiredDepth: number,
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

	const systemPrompt = `You are an expert technical interviewer analyzing a software engineering interview. 
Your task is to evaluate the candidate's responses for technical depth and understanding.

Required topics to assess: ${requiredTopics.join(', ')}
Minimum topics needed: ${minTopicsCovered}
Required depth (confidence): ${requiredDepth}

Evaluation criteria:
1. Technical accuracy of responses
2. Depth of understanding (not just surface-level knowledge)
3. Real-world application examples
4. Problem-solving approach
5. Communication clarity

For each topic:
- Score 0.2: Basic mention without detail
- Score 0.4: Surface level explanation
- Score 0.6: Good understanding with some details
- Score 0.8: In-depth knowledge with examples
- Score 1.0: Expert-level understanding with implementation details

Focus on:
- Concrete examples over theoretical knowledge
- Implementation details over general concepts
- Problem-solving approach over memorized answers
- Technical accuracy and precision
- Follow-up potential for deeper discussion

Example good response analysis:
- If candidate explains React state management with hooks, context, and performance considerations: 0.8-1.0
- If candidate describes REST with proper HTTP methods, status codes, and real examples: 0.8-1.0
- If candidate explains Node.js event loop with examples and error handling: 0.8-1.0`;

	try {
		const response = await openai.chat.completions.create({
			model: 'gpt-4o-mini',
			messages: [
				{
					role: 'system',
					content: systemPrompt,
				},
				...validConversation,
				{
					role: 'system',
					content: `Please analyze the conversation and provide:
1. Which required topics were meaningfully covered
2. Confidence score for each covered topic
3. Brief summary of the candidate's technical understanding
4. Suggested follow-up questions to probe deeper

Format your response as a JSON object with:
{
  "covered_topics": string[],
  "confidence_scores": number[],
  "summary": string,
  "follow_up_questions": string[]
}`,
				},
			],
			response_format: { type: 'json_object' },
			temperature: 0.1, // Add lower temperature for more consistent analysis
			max_tokens: 1000, // Ensure enough tokens for detailed analysis
		});

		if (!response.choices[0].message.content) {
			throw new Error('No analysis result received');
		}

		const result = JSON.parse(response.choices[0].message.content) as AnalysisResult;

		// Validate and clean up the result
		return {
			covered_topics: result.covered_topics || [],
			confidence_scores: result.confidence_scores || [],
			summary: result.summary || 'No summary provided',
			follow_up_questions: result.follow_up_questions || [],
		};
	} catch (error) {
		console.error('OpenAI API error:', error);
		throw new Error('Failed to analyze interview content');
	}
}
