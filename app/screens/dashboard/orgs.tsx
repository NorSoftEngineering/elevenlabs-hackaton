import { createBrowserClient } from '@supabase/ssr';
import { useEffect, useState } from 'react';
import { Link, useLoaderData } from 'react-router';
import RoleGuard from '~/components/RoleGuard';
import type { Organization } from '~/types/organization';
import { getSupabaseEnv } from '~/utils/env.server';

type OrganizationWithMemberCount = Organization & {
	member_count: number;
	user_role: string;
};

export const loader = async () => {
	return {
		env: getSupabaseEnv(),
	};
};

export default function OrganizationsPage() {
	const { env } = useLoaderData<typeof loader>();
	const supabase = createBrowserClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
	const [organizations, setOrganizations] = useState<OrganizationWithMemberCount[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		async function loadOrganizations() {
			const {
				data: { session },
			} = await supabase.auth.getSession();

			if (!session?.user) {
				setError('Not authenticated');
				setIsLoading(false);
				return;
			}

			// Get all organizations the user is a member of
			const { data: memberships, error: membershipError } = await supabase
				.from('organization_members')
				.select('organization_id, role')
				.eq('user_id', session.user.id);

			if (membershipError) {
				console.error('Error loading memberships:', membershipError);
				setError('Failed to load organizations');
				setIsLoading(false);
				return;
			}

			if (!memberships.length) {
				setOrganizations([]);
				setIsLoading(false);
				return;
			}

			// Get organizations with member count
			const { data: orgsData, error: orgsError } = await supabase
				.from('organizations')
				.select('*, member_count:organization_members(count)')
				.in(
					'id',
					memberships.map(m => m.organization_id),
				);

			if (orgsError) {
				console.error('Error loading organizations:', orgsError);
				setError('Failed to load organizations');
				setIsLoading(false);
				return;
			}

			// Combine org data with member count and user role
			const orgsWithCount = orgsData.map(org => ({
				...org,
				member_count: org.member_count[0].count,
				user_role: memberships.find(m => m.organization_id === org.id)?.role || 'member',
			}));

			setOrganizations(orgsWithCount);
			setIsLoading(false);
		}

		loadOrganizations();
	}, [supabase]);

	if (isLoading) {
		return <div>Loading...</div>;
	}

	if (error) {
		return <div className="text-brand-accent">{error}</div>;
	}

	return (
		<RoleGuard allowedRoles={['interviewer', 'admin']} redirectTo="/candidate/dashboard">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="sm:flex sm:items-center">
					<div className="sm:flex-auto">
						<h1 className="text-base font-semibold leading-6 text-gray-900">Organizations</h1>
						<p className="mt-2 text-sm text-gray-700">A list of all organizations you are a member of.</p>
					</div>
					<div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
						<Link
							to="/dashboard/orgs/new"
							className="block rounded-md bg-brand-primary px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-brand-primary/90"
						>
							Create Organization
						</Link>
					</div>
				</div>

				<div className="mt-8 flow-root">
					<div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
						<div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
							<div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
								<table className="min-w-full divide-y divide-gray-300">
									<thead className="bg-gray-50">
										<tr>
											<th
												scope="col"
												className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
											>
												Name
											</th>
											<th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
												Members
											</th>
											<th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
												Your Role
											</th>
											<th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
												<span className="sr-only">Actions</span>
											</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-gray-200 bg-white">
										{organizations.map(org => (
											<tr key={org.id}>
												<td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
													{org.name}
												</td>
												<td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{org.member_count}</td>
												<td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
													{org.user_role.charAt(0).toUpperCase() + org.user_role.slice(1)}
												</td>
												<td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
													<div className="flex justify-end gap-4">
														<Link
															to={`/dashboard/orgs/${org.slug}/settings`}
															className="text-brand-primary hover:text-brand-primary/80"
														>
															Settings
														</Link>
														<Link
															to={`/dashboard/orgs/${org.slug}/members`}
															className="text-brand-primary hover:text-brand-primary/80"
														>
															Members
														</Link>
													</div>
												</td>
											</tr>
										))}
									</tbody>
								</table>

								{organizations.length === 0 && (
									<div className="text-center py-12">
										<h3 className="mt-2 text-sm font-semibold text-gray-900">No organizations</h3>
										<p className="mt-1 text-sm text-gray-500">Get started by creating a new organization.</p>
										<div className="mt-6">
											<Link
												to="/dashboard/orgs/new"
												className="inline-flex items-center rounded-md bg-brand-primary px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-primary/90"
											>
												Create Organization
											</Link>
										</div>
									</div>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
		</RoleGuard>
	);
}
