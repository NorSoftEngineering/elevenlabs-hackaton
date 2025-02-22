import { Link } from 'react-router';
import { useRole } from '~/contexts/RoleContext';
import { isInterviewerRole } from '~/types/role';

export default function Navigation() {
	const { userRole, isLoading } = useRole();

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
					<div className="flex items-center">
						<div className="flex-shrink-0">
							<div className="relative inline-block text-left">
								<div>
									<span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-brand-primary/10 text-brand-primary">
										{userRole ? userRole.charAt(0).toUpperCase() + userRole.slice(1) : 'Guest'}
									</span>
								</div>
							</div>
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
