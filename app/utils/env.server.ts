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
