import { createBrowserClient } from '@supabase/ssr';
import { Links, LinksFunction, Meta, Outlet, Scripts, ScrollRestoration, useLoaderData } from 'react-router';

import Navbar from '~/components/Navbar';
import { getSupabaseEnv } from '~/utils/env.server';
import { createSupabaseServer } from '~/utils/supabase.server';
import Layout from './components/Layout';
import { Toaster } from './components/ui/sonner';
import { OrganizationProvider } from './contexts/OrganizationContext';
import { RoleProvider } from './contexts/RoleContext';
import { AppLayout } from './layouts/AppLayout';

import globalStyles from './styles/globals.css?url';
import styles from './tailwind.css?url';

export const links: LinksFunction = () => [
	{ rel: 'stylesheet', href: styles },
	{ rel: 'stylesheet', href: globalStyles },
	// Favicon
	{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
	{ rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
	{ rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' },
	// Apple Touch Icon
	{ rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
	// Android Icons
	{ rel: 'icon', type: 'image/png', sizes: '192x192', href: '/android-chrome-192x192.png' },
	{ rel: 'icon', type: 'image/png', sizes: '512x512', href: '/android-chrome-512x512.png' },
	// Web Manifest
	{ rel: 'manifest', href: '/site.webmanifest' },
];

export const headers = () => ({
	'Cache-Control': 'no-store',
});

export const meta = () => [
	{
		title: 'TalentBud',
	},
	{
		description:
			'Transform your recruitment process with AI-powered scheduling, intelligent screening, and automated feedback. The future of hiring is here.',
	},
	{
		charset: 'utf-8',
	},
	{
		name: 'viewport',
		content: 'width=device-width, initial-scale=1.0',
	},
	{
		property: 'og:url',
		content: 'https://talent-bud.vercel.app/',
	},
	{
		property: 'og:title',
		content: 'TalentBud',
	},
	{
		property: 'og:description',
		content:
			'Transform your recruitment process with AI-powered scheduling, intelligent screening, and automated feedback. The future of hiring is here.',
	},
	{
		property: 'og:image',
		content: 'https://talent-bud.vercel.app/social.png',
	},
	{
		property: 'og:image:width',
		content: '1200',
	},
	{
		property: 'og:image:height',
		content: '630',
	},
];

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

	return (
		<html lang="en">
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<Meta />
				<Links />
				<title>TalentBud</title>
			</head>
			<body>
				<RoleProvider env={env}>
					<OrganizationProvider env={env}>
						<Layout context={{ supabase, session }}>
							<Outlet context={{ supabase, session }} />
						</Layout>
					</OrganizationProvider>
				</RoleProvider>
				<ScrollRestoration />
				<Scripts />
				<Toaster position="top-right" expand={true} richColors closeButton theme="light" />
			</body>
		</html>
	);
}
