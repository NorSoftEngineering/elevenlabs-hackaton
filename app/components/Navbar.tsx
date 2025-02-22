import { Link } from 'react-router';
import type { OutletContext } from '~/types/context';

interface NavbarProps {
	context: OutletContext;
}

export default function Navbar({ context: { session, supabase } }: NavbarProps) {
	const handleSignOut = async () => {
		await supabase.auth.signOut();
		// The auth state change in root.tsx will trigger a page reload
	};

	return (
		<nav className="bg-white shadow">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="flex h-16 justify-between">
					<div className="flex">
						<Link to="/" className="flex items-center text-xl font-bold text-gray-800">
							TalentBud
						</Link>
					</div>
					<div className="flex items-center">
						{session ? (
							<div className="flex items-center gap-4">
								<span className="text-sm text-gray-700">{session.user.email}</span>
								<button
									onClick={handleSignOut}
									type="button"
									className="rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
								>
									Sign out
								</button>
							</div>
						) : (
							<Link
								to="/login"
								className="rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
							>
								Sign in
							</Link>
						)}
					</div>
				</div>
			</div>
		</nav>
	);
}
