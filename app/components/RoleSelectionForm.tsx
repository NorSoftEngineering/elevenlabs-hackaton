import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useRole } from '~/contexts/RoleContext';
import { UserRole } from '~/types/role';

export default function RoleSelectionForm() {
	const navigate = useNavigate();
	const { updateRole } = useRole();
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleRoleSelection = async (role: 'interviewer' | 'candidate') => {
		setIsLoading(true);
		setError(null);

		try {
			await updateRole(role);
			navigate(role === 'interviewer' ? '/dashboard' : '/candidate/dashboard');
		} catch (err) {
			setError('Failed to update role. Please try again.');
			console.error('Error updating role:', err);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
			<div className="max-w-md w-full space-y-8">
				<div className="text-center">
					<h2 className="mt-6 text-3xl font-extrabold text-gray-900">Choose your role</h2>
					<p className="mt-2 text-sm text-gray-600">Select how you want to use TalentBud</p>
				</div>

				{error && (
					<div className="rounded-md bg-red-50 p-4">
						<div className="text-sm text-red-700">{error}</div>
					</div>
				)}

				<div className="mt-8 space-y-4">
					<button
						onClick={() => handleRoleSelection('interviewer')}
						disabled={isLoading}
						className="relative w-full flex justify-center py-4 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
					>
						{isLoading ? (
							<span className="absolute left-1/2 transform -translate-x-1/2">
								<svg
									className="animate-spin h-5 w-5 text-white"
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
								>
									<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
									<path
										className="opacity-75"
										fill="currentColor"
										d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
									></path>
								</svg>
							</span>
						) : (
							<>
								<span className="absolute left-0 inset-y-0 flex items-center pl-3">
									<svg
										className="h-5 w-5 text-indigo-300"
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 20 20"
										fill="currentColor"
									>
										<path
											fillRule="evenodd"
											d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
											clipRule="evenodd"
										/>
									</svg>
								</span>
								I want to interview candidates
							</>
						)}
					</button>

					<button
						onClick={() => handleRoleSelection('candidate')}
						disabled={isLoading}
						className="relative w-full flex justify-center py-4 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
					>
						{isLoading ? (
							<span className="absolute left-1/2 transform -translate-x-1/2">
								<svg
									className="animate-spin h-5 w-5 text-gray-700"
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
								>
									<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
									<path
										className="opacity-75"
										fill="currentColor"
										d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
									></path>
								</svg>
							</span>
						) : (
							<>
								<span className="absolute left-0 inset-y-0 flex items-center pl-3">
									<svg
										className="h-5 w-5 text-gray-400"
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 20 20"
										fill="currentColor"
									>
										<path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
									</svg>
								</span>
								I'm looking for opportunities
							</>
						)}
					</button>
				</div>
			</div>
		</div>
	);
}
