import { createBrowserClient } from '@supabase/ssr';
import { redirect, useLoaderData } from 'react-router';

import { getSupabaseEnv } from '~/utils/env.server';
import { createSupabaseServer } from '~/utils/supabase.server';

export const headers = () => ({
	'Cache-Control': 'no-store',
});

export const loader = async ({ request }: { request: Request }) => {
	const supabase = createSupabaseServer(request, new Headers());

	const { data: sessionData } = await supabase.auth.getSession();

	if (sessionData.session) {
		throw redirect('/dashboard');
	}
	const url = new URL(request.url);
	return {
		env: getSupabaseEnv(),
		origin: url.origin,
	};
};

export default function Login() {
	const { env, origin } = useLoaderData<typeof loader>();
	const supabase = createBrowserClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);

	const handleGoogleLogin = async () => {
		await supabase.auth.signInWithOAuth({
			provider: 'google',
			options: {
				redirectTo: `${origin}/auth/google/callback`,
			},
		});
	};

	return (
		<div className="flex min-h-screen items-center justify-center">
			<button
				onClick={handleGoogleLogin}
				className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-gray-700 shadow-md hover:bg-gray-50"
			>
				<img src="https://www.google.com/favicon.ico" alt="Google" className="h-5 w-5" />
				Sign in with Google
			</button>
		</div>
	);
}
