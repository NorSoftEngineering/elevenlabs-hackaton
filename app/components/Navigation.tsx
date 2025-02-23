import { Session } from '@supabase/supabase-js';
import { SupabaseClient } from '@supabase/supabase-js';
import { useState } from 'react';
import { Link } from 'react-router';
import { useOutletContext } from 'react-router';
import { useRole } from '~/contexts/RoleContext';
import type { OutletContext } from '~/types/context';
import { isInterviewerRole } from '~/types/role';

export default function Navigation({ context }: { context: { session: Session; supabase: SupabaseClient } }) {
	const { userRole, isLoading } = useRole();
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);

	const handleSignOut = async () => {
		await context.supabase.auth.signOut();
		// The auth state change in root.tsx will trigger a page reload
	};

	if (isLoading) return null;

	const interviewerLinks = [
		{ href: '/organizations', label: 'Organizations' },
		{ href: '/interviews', label: 'Interviews' },
		{ href: '/analytics', label: 'Analytics' },
	];

	const candidateLinks = [
		{ href: '/candidate/dashboard', label: 'Dashboard' },
		{ href: '/candidate/interviews', label: 'My Interviews' },
		{ href: '/candidate/profile', label: 'Profile' },
	];

	const links = isInterviewerRole(userRole) ? interviewerLinks : candidateLinks;

	return (
		<nav className="bg-white shadow">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between h-16">
					<div className="flex">
						<div className="flex-shrink-0 flex items-center">
							<Link to="/" className="text-xl font-bold text-brand-primary">
								TalentBud
							</Link>
						</div>
						<div className="hidden sm:ml-6 sm:flex sm:space-x-8">
							{links.map(link => (
								<Link
									key={link.href}
									to={link.href}
									className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 hover:text-brand-primary"
								>
									{link.label}
								</Link>
							))}
						</div>
					</div>
					<div className="flex items-center space-x-4">
						<div className="flex-shrink-0">
							<div className="relative inline-block text-left">
								<div>
									<span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-brand-primary/10 text-brand-primary">
										{userRole ? userRole.charAt(0).toUpperCase() + userRole.slice(1) : 'Guest'}
									</span>
								</div>
							</div>
						</div>

						<div className="relative">
							<button
								onClick={() => setIsDropdownOpen(!isDropdownOpen)}
								className="flex items-center justify-center w-8 h-8 rounded-full bg-brand-primary/10 text-brand-primary hover:bg-brand-primary/20 focus:outline-none"
							>
								<span className="text-sm font-medium">{context.session?.user.email?.[0].toUpperCase() || 'G'}</span>
							</button>

							{isDropdownOpen && (
								<div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100">
									<div className="px-4 py-3">
										<p className="text-sm">Signed in as</p>
										<p className="text-sm font-medium text-gray-900 truncate">
											{context.session?.user.email || 'Guest'}
										</p>
									</div>
									<div className="py-1" role="menu">
										<button
											onClick={handleSignOut}
											className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
											role="menuitem"
										>
											<svg className="mr-3 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
												/>
											</svg>
											Logout
										</button>
									</div>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>

			{/* Mobile menu */}
			<div className="sm:hidden">
				<div className="pt-2 pb-3 space-y-1">
					{links.map(link => (
						<Link
							key={link.href}
							to={link.href}
							className="block pl-3 pr-4 py-2 text-base font-medium text-gray-700 hover:text-brand-primary hover:bg-gray-50"
						>
							{link.label}
						</Link>
					))}
				</div>
			</div>
		</nav>
	);
}
