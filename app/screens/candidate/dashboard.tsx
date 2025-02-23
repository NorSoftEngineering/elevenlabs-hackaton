import { createBrowserClient } from '@supabase/ssr';
import { useEffect, useState } from 'react';
import { useLoaderData } from 'react-router';
import { Link } from 'react-router';
import { toast } from 'sonner';
import RoleGuard from '~/components/RoleGuard';
import type { CandidateProfile } from '~/types/candidate';
import { getSupabaseEnv } from '~/utils/env.server';

export const loader = async () => {
	return {
		env: getSupabaseEnv(),
	};
};

type Stats = {
	totalInterviews: number;
	upcomingInterviews: number;
	completedInterviews: number;
	averageDuration: number;
};

type Interview = {
	id: string;
	interview_id: string;
	interview_name: string;
	interview_description?: string;
	interview_duration: number;
	interview_start_at: string;
	organization_name: string;
	status: string;
};

export default function CandidateDashboard() {
	const { env } = useLoaderData<typeof loader>();
	const supabase = createBrowserClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
	const [upcomingInterviews, setUpcomingInterviews] = useState<Interview[]>([]);
	const [stats, setStats] = useState<Stats>({
		totalInterviews: 0,
		upcomingInterviews: 0,
		completedInterviews: 0,
		averageDuration: 0,
	});
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [profileCompletion, setProfileCompletion] = useState(0);

	useEffect(() => {
		async function loadDashboardData() {
			try {
				const { data: session } = await supabase.auth.getSession();
				if (!session.session?.user.id) return;

				// Load upcoming interviews
				const { data: interviews, error: interviewError } = await supabase
					.from('candidate_interviews')
					.select('*')
					.eq('candidate_id', session.session.user.id)
					.gt('interview_start_at', new Date().toISOString())
					.order('interview_start_at', { ascending: true })
					.limit(5);

				if (interviewError) {
					toast.error('Failed to load upcoming interviews');
					throw interviewError;
				}

				setUpcomingInterviews(interviews || []);

				// Load interview stats
				const { data: allInterviews, error: statsError } = await supabase
					.from('candidate_interviews')
					.select('*')
					.eq('candidate_id', session.session.user.id);

				if (statsError) {
					toast.error('Failed to load interview stats');
					throw statsError;
				}

				const now = new Date();
				const completed = allInterviews?.filter(i => new Date(i.interview_start_at) < now) || [];
				const upcoming = allInterviews?.filter(i => new Date(i.interview_start_at) > now) || [];
				const avgDuration = completed.reduce((acc, curr) => acc + curr.interview_duration, 0) / (completed.length || 1);

				setStats({
					totalInterviews: allInterviews?.length || 0,
					completedInterviews: completed.length,
					upcomingInterviews: upcoming.length,
					averageDuration: Math.round(avgDuration),
				});

				// Calculate profile completion
				const { data: profile, error: profileError } = await supabase
					.from('candidate_profiles')
					.select('*')
					.eq('profile_id', session.session.user.id)
					.single();

				if (profileError) {
					toast.error('Failed to load profile data');
					throw profileError;
				}

				const fields = ['name', 'title', 'bio', 'skills', 'experience_years', 'location', 'resume_url'];
				const completedFields = fields.filter(field => profile && profile[field]);
				const newCompletion = (completedFields.length / fields.length) * 100;
				setProfileCompletion(newCompletion);
			} catch (err) {
				console.error('Error loading dashboard data:', err);
				setError('Failed to load dashboard data');
			} finally {
				setIsLoading(false);
			}
		}

		loadDashboardData();
	}, [supabase]);

	if (isLoading) {
		return <div>Loading...</div>;
	}

	return (
		<RoleGuard allowedRoles={['candidate']} redirectTo="/dashboard/orgs">
			<div className="space-y-6">
				{/* Stats Overview */}
				<div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
					<div className="bg-white overflow-hidden shadow rounded-lg">
						<div className="p-5">
							<div className="flex items-center">
								<div className="flex-shrink-0">
									<svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
										/>
									</svg>
								</div>
								<div className="ml-5 w-0 flex-1">
									<dl>
										<dt className="text-sm font-medium text-gray-500 truncate">Total Interviews</dt>
										<dd className="text-lg font-medium text-gray-900">{stats.totalInterviews}</dd>
									</dl>
								</div>
							</div>
						</div>
					</div>

					<div className="bg-white overflow-hidden shadow rounded-lg">
						<div className="p-5">
							<div className="flex items-center">
								<div className="flex-shrink-0">
									<svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
										/>
									</svg>
								</div>
								<div className="ml-5 w-0 flex-1">
									<dl>
										<dt className="text-sm font-medium text-gray-500 truncate">Upcoming Interviews</dt>
										<dd className="text-lg font-medium text-gray-900">{stats.upcomingInterviews}</dd>
									</dl>
								</div>
							</div>
						</div>
					</div>

					<div className="bg-white overflow-hidden shadow rounded-lg">
						<div className="p-5">
							<div className="flex items-center">
								<div className="flex-shrink-0">
									<svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
										/>
									</svg>
								</div>
								<div className="ml-5 w-0 flex-1">
									<dl>
										<dt className="text-sm font-medium text-gray-500 truncate">Completed Interviews</dt>
										<dd className="text-lg font-medium text-gray-900">{stats.completedInterviews}</dd>
									</dl>
								</div>
							</div>
						</div>
					</div>

					<div className="bg-white overflow-hidden shadow rounded-lg">
						<div className="p-5">
							<div className="flex items-center">
								<div className="flex-shrink-0">
									<svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
										/>
									</svg>
								</div>
								<div className="ml-5 w-0 flex-1">
									<dl>
										<dt className="text-sm font-medium text-gray-500 truncate">Average Duration</dt>
										<dd className="text-lg font-medium text-gray-900">{stats.averageDuration} min</dd>
									</dl>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Profile Completion Card */}
				<div className="bg-white overflow-hidden shadow rounded-lg">
					<div className="p-6">
						<div className="flex items-center justify-between">
							<h2 className="text-xl font-semibold text-gray-900">Profile Completion</h2>
							<span className="text-sm text-gray-500">{Math.round(profileCompletion)}%</span>
						</div>
						<div className="mt-4 w-full bg-gray-200 rounded-full h-2.5">
							<div
								className="bg-brand-primary h-2.5 rounded-full transition-all duration-500"
								style={{ width: `${profileCompletion}%` }}
							></div>
						</div>
						<div className="mt-4">
							<Link
								to="/candidate/profile/edit"
								className="text-sm font-medium text-brand-primary hover:text-brand-primary/80"
							>
								Complete your profile →
							</Link>
						</div>
					</div>
				</div>

				{/* Upcoming Interviews */}
				<div className="bg-white overflow-hidden shadow rounded-lg">
					<div className="p-6">
						<div className="flex justify-between items-center mb-4">
							<h2 className="text-xl font-semibold text-gray-900">Upcoming Interviews</h2>
							<Link
								to="/candidate/interviews"
								className="text-sm font-medium text-brand-primary hover:text-brand-primary/80"
							>
								View all →
							</Link>
						</div>
						{error && <p className="text-brand-accent mb-4">{error}</p>}
						{upcomingInterviews.length === 0 ? (
							<div className="text-center py-12">
								<svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
									/>
								</svg>
								<h3 className="mt-2 text-sm font-medium text-gray-900">No upcoming interviews</h3>
								<p className="mt-1 text-sm text-gray-500">Your schedule is clear for now.</p>
							</div>
						) : (
							<div className="space-y-4">
								{upcomingInterviews.map(interview => (
									<div key={interview.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
										<div className="flex justify-between items-start">
											<div>
												<h3 className="text-lg font-medium text-gray-900">{interview.interview_name}</h3>
												<p className="text-sm text-gray-500">{interview.organization_name}</p>
												{interview.interview_description && (
													<p className="text-sm text-gray-600 mt-2">{interview.interview_description}</p>
												)}
											</div>
											<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
												{interview.status}
											</span>
										</div>
										<div className="mt-2 text-sm text-gray-500">
											{new Date(interview.interview_start_at).toLocaleString()} ({interview.interview_duration} min)
										</div>
										<div className="mt-2">
											<Link
												to={`/candidate/interviews/${interview.interview_id}`}
												className="text-sm font-medium text-brand-primary hover:text-brand-primary/80"
											>
												View details →
											</Link>
										</div>
									</div>
								))}
							</div>
						)}
					</div>
				</div>
			</div>
		</RoleGuard>
	);
}
