import { ReactNode } from 'react';
import { Link } from 'react-router';
import { OrganizationSelector } from '~/components/OrganizationSelector';
import { useOrganization } from '~/contexts/OrganizationContext';
import { useAuth } from '../contexts/AuthContext';

export function DashboardLayout({ children }: { children: ReactNode }) {
	const { isLoading, currentOrganization } = useOrganization();
	const { signOut, user } = useAuth();

	if (isLoading) {
		return <div className="text-gray-700">Loading...</div>;
	}

	return (
		<div className="min-h-screen bg-brand-neutral/70">
			<div className="bg-white shadow">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<div className="flex h-16 justify-between">
						<div className="flex justify-between w-full">
							<div className="flex flex-shrink-0 items-center">
								<h1 className="text-lg font-bold text-gray-700">Manage your organization</h1>
							</div>
							{currentOrganization && (
								<div className="ml-6 flex space-x-4 items-center">
									<Link
										to={`/dashboard/orgs/${currentOrganization.slug}/settings`}
										className="text-gray-700 hover:text-brand-primary px-3 py-2 text-sm font-medium"
									>
										Settings
									</Link>
									<Link
										to={`/dashboard/orgs/${currentOrganization.slug}/members`}
										className="text-gray-700 hover:text-brand-primary px-3 py-2 text-sm font-medium"
									>
										Members
									</Link>
								</div>
							)}
						</div>
						<div className="flex items-center space-x-4">
							<OrganizationSelector />
							<div className="flex items-center space-x-4 ml-4 pl-4 border-l border-brand-neutral/20">
								<span className="text-sm text-gray-700">{user?.email}</span>
								<button onClick={() => signOut()} className="text-sm text-brand-accent hover:text-brand-accent/80">
									Sign Out
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>

			<main>
				<div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">{children}</div>
			</main>
		</div>
	);
}
