import { Outlet } from 'react-router';
import { useLoaderData } from 'react-router';
import { AppLayout } from '~/layouts/AppLayout';
import { getSupabaseEnv } from '~/utils/env.server';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { DashboardLayout } from '../layouts/DashboardLayout';

export const loader = async ({ request: _req }: { request: Request }) => {
	const env = getSupabaseEnv();
	return {
		env,
	};
};

export default function ProtectedRouteHandler() {
	const { env } = useLoaderData<typeof loader>();
	return (
		<AppLayout env={env}>
			<ProtectedRoute>
				<DashboardLayout>
					<Outlet />
				</DashboardLayout>
			</ProtectedRoute>
		</AppLayout>
	);
}
