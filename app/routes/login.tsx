import { useLoaderData } from 'react-router';
import { getSupabaseEnv } from '~/utils/env.server';
import { createBrowserSupabaseClient } from '~/utils/supabase.client';

export const headers = () => ({
	'Cache-Control': 'no-store',
});

export const loader = async ({ request }: { request: Request }) => {
	const url = new URL(request.url);
	return {
		env: getSupabaseEnv(),
		origin: url.origin,
	};
};
