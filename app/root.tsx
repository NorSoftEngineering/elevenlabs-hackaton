import { createBrowserClient } from '@supabase/ssr';
import { useEffect } from 'react';
import { Links, LinksFunction, Meta, Outlet, Scripts, ScrollRestoration, useLoaderData } from 'react-router';

import Navbar from '~/components/Navbar';
import { createSupabaseServer } from '~/utils/supabase.server';

import globalStyles from './styles/globals.css?url';
import styles from './tailwind.css?url';

export const links: LinksFunction = () => [
	{ rel: 'stylesheet', href: styles },
	{ rel: 'stylesheet', href: globalStyles },
];

export const headers = () => ({
	'Cache-Control': 'no-store',
});

export const loader = async ({ request }: { request: Request }) => {
	const headers = new Headers();
	const supabase = createSupabaseServer(request, headers);
	const {
		data: { session },
	} = await supabase.auth.getSession();

	return {
		env: {
			SUPABASE_URL: process.env.SUPABASE_URL!,
			SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY!,
		},
		session,
		headers,
	};
};

export default function App() {
	const { env, session } = useLoaderData<typeof loader>();
	const supabase = createBrowserClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
	const context = { supabase, session };

	useEffect(() => {
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((event, newSession) => {
			if (newSession?.access_token !== session?.access_token) {
				// Instead of revalidate, we'll do a full page refresh for edge
				window.location.reload();
			}
		});

		return () => {
			subscription.unsubscribe();
		};
	}, [supabase, session]);

	return (
		<html lang="en">
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<Meta />
				<Links />
			</head>
			<body>
				<Navbar context={context} />
				<main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
					<Outlet context={context} />
				</main>
				<ScrollRestoration />
				<Scripts />
			</body>
		</html>
	);
}
