function getRequiredEnvVar(name: string): string {
	const value = process.env[name];
	if (!value) {
		throw new Error(`Missing required environment variable: ${name}`);
	}
	return value;
}

export function getSupabaseEnv() {
	return {
		SUPABASE_URL: getRequiredEnvVar('SUPABASE_URL'),
		SUPABASE_ANON_KEY: getRequiredEnvVar('SUPABASE_ANON_KEY'),
	};
}

export function getEnv() {
	const ELEVEN_LABS_API_KEY = process.env.ELEVEN_LABS_API_KEY;
	const ELEVEN_LABS_AGENT_ID = process.env.ELEVEN_LABS_AGENT_ID;

	if (!ELEVEN_LABS_API_KEY) {
		throw new Error('ELEVEN_LABS_API_KEY is required');
	}

	if (!ELEVEN_LABS_AGENT_ID) {
		throw new Error('ELEVEN_LABS_AGENT_ID is required');
	}

	return {
		ELEVEN_LABS_API_KEY,
		ELEVEN_LABS_AGENT_ID,
	};
}
