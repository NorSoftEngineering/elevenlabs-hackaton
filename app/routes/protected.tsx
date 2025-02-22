import { Outlet, useNavigate } from 'react-router';
import { useLoaderData } from 'react-router';
import { createBrowserClient } from '@supabase/ssr';
import { AppLayout } from '~/layouts/AppLayout';
import { getSupabaseEnv } from '~/utils/env.server';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { OrganizationProvider } from '~/contexts/OrganizationContext';
import { useEffect } from 'react';
import { useOrganization } from '~/contexts/OrganizationContext';

export const loader = async ({ request: _req }: { request: Request }) => {
	const env = getSupabaseEnv();
	return {
		env,
	};
};

export default function ProtectedRouteHandler() {
	const { env } = useLoaderData<typeof loader>();
	const navigate = useNavigate();
	const supabase = createBrowserClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);

	return (
		<AppLayout env={env}>
			<ProtectedRoute>
				<OrganizationProvider env={env}>
					<RequireOrganization>
						<DashboardLayout>
							<Outlet />
						</DashboardLayout>
					</RequireOrganization>
				</OrganizationProvider>
			</ProtectedRoute>
		</AppLayout>
	);
}

function RequireOrganization({ children }: { children: React.ReactNode }) {
	const { currentOrganization, isLoading, userOrganizations } = useOrganization();
	const navigate = useNavigate();
	const path = window.location.pathname;

	useEffect(() => {		
		// Only handle navigation after loading is complete
		if (!isLoading && !path.includes('/orgs/new')) {
			if (userOrganizations.length === 0) {
				console.log('Redirecting to create org page - no orgs');
				navigate('/dashboard/orgs/new');
			} else if (path === '/dashboard') {
        // if user has orgs, let him see the dashboard
			}
		}
	}, [userOrganizations, isLoading, navigate, path]);

	if (isLoading) {
		return <div>Loading...</div>;
	}

	return <>{children}</>;
}
