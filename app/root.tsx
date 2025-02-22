import { createBrowserClient } from '@supabase/ssr';
import { Links, LinksFunction, Meta, Outlet, Scripts, ScrollRestoration, useLoaderData } from 'react-router';

import Navbar from '~/components/Navbar';
import { getSupabaseEnv } from '~/utils/env.server';
import { createSupabaseServer } from '~/utils/supabase.server';
import { AppLayout } from './layouts/AppLayout';

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
		env: getSupabaseEnv(),
		session,
		headers,
	};
};

export default function App() {
	const { env, session } = useLoaderData<typeof loader>();
	const supabase = createBrowserClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
	const context = { supabase, session };

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
				<main className="">
					<AppLayout env={env}>
						<Outlet context={context} />
					</AppLayout>
				</main>
				<ScrollRestoration />
				<Scripts />
			</body>
		</html>
	);
}
