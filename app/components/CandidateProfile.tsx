import type { CandidateProfile as CandidateProfileType } from '~/types/interview';

interface CandidateProfileProps {
	profile: CandidateProfileType;
	className?: string;
}

export function CandidateProfile({ profile, className = '' }: CandidateProfileProps) {
	return (
		<div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
			<div className="space-y-6">
				{/* Header with name and title */}
				<div className="flex items-start justify-between border-b pb-4">
					<div>
						<h2 className="text-2xl font-semibold text-gray-900">{profile.name}</h2>
						{profile.title && <p className="text-lg text-gray-600 mt-1">{profile.title}</p>}
					</div>
					<div className="flex items-center space-x-2 text-sm text-gray-500">
						{profile.experience_years && (
							<span className="px-3 py-1 rounded-full bg-brand-primary/10 text-brand-primary">
								{profile.experience_years} years exp.
							</span>
						)}
					</div>
				</div>

				{/* Contact Information */}
				<div className="grid grid-cols-2 gap-4">
					{profile.phone && (
						<div>
							<h3 className="text-sm font-medium text-gray-500">Phone</h3>
							<p className="mt-1 text-sm text-gray-900">{profile.phone}</p>
						</div>
					)}
					{profile.location && (
						<div>
							<h3 className="text-sm font-medium text-gray-500">Location</h3>
							<p className="mt-1 text-sm text-gray-900">{profile.location}</p>
						</div>
					)}
				</div>

				{/* Bio */}
				{profile.bio && (
					<div>
						<h3 className="text-sm font-medium text-gray-500 mb-2">About</h3>
						<p className="text-sm text-gray-700 whitespace-pre-wrap">{profile.bio}</p>
					</div>
				)}

				{/* Skills */}
				{profile.skills && profile.skills.length > 0 && (
					<div>
						<h3 className="text-sm font-medium text-gray-500 mb-2">Skills</h3>
						<div className="flex flex-wrap gap-2">
							{profile.skills.map((skill: string, index: number) => (
								<span key={index} className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm">
									{skill}
								</span>
							))}
						</div>
					</div>
				)}

				{/* Resume */}
				{profile.resume_url && (
					<div>
						<h3 className="text-sm font-medium text-gray-500 mb-2">Resume</h3>
						<a
							href={profile.resume_url}
							target="_blank"
							rel="noopener noreferrer"
							className="inline-flex items-center text-brand-primary hover:text-brand-primary-dark"
						>
							<svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
								/>
							</svg>
							{profile.resume_filename || 'Download Resume'}
						</a>
					</div>
				)}
			</div>
		</div>
	);
}
