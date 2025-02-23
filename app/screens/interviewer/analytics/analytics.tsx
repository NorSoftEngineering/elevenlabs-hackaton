import { Link } from 'react-router';
import { type LoaderFunctionArgs, useLoaderData, useNavigation, useSearchParams } from 'react-router';
import { ErrorBoundary } from '~/components/ErrorBoundary';
import { createSupabaseServer } from '~/utils/supabase.server';
import { CandidateMetrics } from './components/CandidateMetrics';
import { CheckpointAnalysis } from './components/CheckpointAnalysis';
import { ExportButton } from './components/ExportButton';
import { InterviewPerformance } from './components/InterviewPerformance';
import { OrganizationInsights } from './components/OrganizationInsights';
import type { AnalyticsData, CandidateData, CandidateProfile } from './types';

export { ErrorBoundary };

export async function loader({ request }: LoaderFunctionArgs) {
	const headers = new Headers();
	const supabase = createSupabaseServer(request, headers);

	// Get the user's session first
	const {
		data: { session },
		error: sessionError,
	} = await supabase.auth.getSession();
	if (sessionError || !session) {
		throw new Error('Not authenticated');
	}

	// Get the organization first
	const { data: orgMember, error: orgError } = await supabase
		.from('organization_members')
		.select('organization_id, role')
		.eq('user_id', session.user.id)
		.single();

	if (orgError || !orgMember) {
		throw new Error('No organization found');
	}

	// Get URL params for date range
	const url = new URL(request.url);
	const days = url.searchParams.get('days') || '30';
	const dateRange = new Date();
	dateRange.setDate(dateRange.getDate() - parseInt(days));

	// Fetch interview stats
	const { data: interviewStats, error: interviewError } = await supabase
		.from('interviews')
		.select(`
			id,
			status,
			duration,
			start_at,
			created_at
		`)
		.eq('organization_id', orgMember.organization_id)
		.gte('created_at', dateRange.toISOString());

	// Fetch candidate stats
	const { data: candidateStats, error: candidateError } = await supabase
		.from('interviews_candidates')
		.select(`
			candidate_id,
			interviews!inner (
				organization_id,
				created_at
			),
			profiles!inner (
				candidate_profiles (
					experience_years,
					skills
				)
			)
		`)
		.eq('interviews.organization_id', orgMember.organization_id)
		.gte('interviews.created_at', dateRange.toISOString());

	// Fetch invitation stats
	const { data: invitationStats, error: invitationError } = await supabase
		.from('interviews_invitations')
		.select(`
			id,
			status,
			interviews!inner (
				organization_id,
				created_at
			)
		`)
		.eq('interviews.organization_id', orgMember.organization_id)
		.gte('interviews.created_at', dateRange.toISOString());

	// Fetch checkpoint stats
	const { data: checkpointStats, error: checkpointError } = await supabase
		.from('interview_checkpoints')
		.select(`
			id,
			completed_at,
			created_at,
			covered_topics,
			interviews!inner (
				organization_id,
				created_at
			)
		`)
		.eq('interviews.organization_id', orgMember.organization_id)
		.gte('interviews.created_at', dateRange.toISOString());

	// Fetch organization stats
	const { data: organizationStats, error: organizationError } = await supabase
		.from('interviews_interviewers')
		.select(`
			interviewer_id,
			interviews!inner (
				organization_id,
				created_at
			)
		`)
		.eq('interviews.organization_id', orgMember.organization_id)
		.gte('interviews.created_at', dateRange.toISOString());

	if (interviewError || candidateError || invitationError || checkpointError || organizationError) {
		console.error(interviewError, candidateError, invitationError, checkpointError, organizationError);
		throw new Error('Failed to fetch analytics data');
	}

	// Process interview stats
	const processedInterviewStats = {
		totalInterviews: interviewStats?.length || 0,
		completedInterviews:
			interviewStats?.filter(i => i.status === 'ready' && new Date(i.start_at) < new Date()).length || 0,
		scheduledInterviews:
			interviewStats?.filter(i => i.status === 'ready' && new Date(i.start_at) >= new Date()).length || 0,
		avgDurationHours:
			interviewStats?.reduce((acc, i) => acc + (i.duration ? parseFloat(i.duration) : 0), 0) /
			(interviewStats?.length || 1),
		timeDistribution:
			interviewStats?.reduce(
				(acc, i) => {
					const day = new Date(i.start_at).getDay();
					const hour = new Date(i.start_at).getHours();
					const key = `${day}_${hour}`;
					acc[key] = (acc[key] || 0) + 1;
					return acc;
				},
				{} as Record<string, number>,
			) || {},
	};

	// Process candidate stats
	const uniqueCandidates = new Set(candidateStats?.map(c => c.candidate_id));
	const allSkills = new Set<string>();
	let totalExperience = 0;
	candidateStats?.forEach((c: CandidateData) => {
		if (c.profiles?.[0]?.candidate_profiles?.[0]?.skills) {
			c.profiles[0].candidate_profiles[0].skills.forEach(s => allSkills.add(s));
		}
		if (c.profiles?.[0]?.candidate_profiles?.[0]?.experience_years) {
			totalExperience += c.profiles[0].candidate_profiles[0].experience_years;
		}
	});

	const processedCandidateStats = {
		totalCandidates: uniqueCandidates.size,
		acceptedInvitations: invitationStats?.filter(i => i.status === 'accepted').length || 0,
		totalInvitations: invitationStats?.length || 0,
		avgExperienceYears: totalExperience / (uniqueCandidates.size || 1),
		allSkills: Array.from(allSkills),
	};

	// Process checkpoint stats
	const allTopics = new Set<string>();
	checkpointStats?.forEach(c => {
		if (c.covered_topics) {
			c.covered_topics.forEach((t: string) => allTopics.add(t));
		}
	});

	const processedCheckpointStats = {
		totalCheckpoints: checkpointStats?.length || 0,
		completedCheckpoints: checkpointStats?.filter(c => c.completed_at).length || 0,
		avgCheckpointDurationMins:
			checkpointStats?.reduce((acc, c) => {
				if (c.completed_at && c.created_at) {
					const duration = new Date(c.completed_at).getTime() - new Date(c.created_at).getTime();
					return acc + duration / 1000 / 60;
				}
				return acc;
			}, 0) / (checkpointStats?.filter(c => c.completed_at).length || 1),
		allTopics: Array.from(allTopics),
	};

	// Process organization stats
	const uniqueInterviewers = new Set(organizationStats?.map(i => i.interviewer_id));

	// Process volume data by day
	const volumeData =
		interviewStats
			?.reduce(
				(acc, interview) => {
					const date = new Date(interview.created_at).toISOString().split('T')[0];
					const existingDay = acc.find(d => d.date === date);
					if (existingDay) {
						existingDay.interviews++;
					} else {
						acc.push({ date, interviews: 1 });
					}
					return acc;
				},
				[] as Array<{ date: string; interviews: number }>,
			)
			.sort((a, b) => a.date.localeCompare(b.date)) || [];

	const processedOrganizationStats = {
		activeInterviewers: uniqueInterviewers.size,
		interviewsPerInterviewer: (organizationStats?.length || 0) / (uniqueInterviewers.size || 1),
		memberRoles: ['Interviewer', 'Admin', 'Manager'], // Hardcoded for now, will be dynamic later
	};

	return {
		interviewStats: processedInterviewStats,
		candidateStats: processedCandidateStats,
		checkpointStats: processedCheckpointStats,
		organizationStats: processedOrganizationStats,
		volumeData,
	};
}

function LoadingState() {
	return (
		<div className="p-6 max-w-6xl mx-auto animate-pulse">
			<div className="flex justify-between items-center mb-6">
				<div className="h-8 w-32 bg-gray-200 rounded"></div>
			</div>

			<div className="bg-white rounded-lg shadow overflow-hidden">
				<div className="p-6">
					<div className="space-y-4">
						{[1, 2, 3].map(i => (
							<div key={i}>
								<div className="h-4 w-24 bg-gray-200 rounded mb-2"></div>
								<div className="h-32 bg-gray-200 rounded"></div>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}

export default function AnalyticsScreen() {
	const data = useLoaderData<typeof loader>();
	const navigation = useNavigation();
	const [searchParams, setSearchParams] = useSearchParams();

	if (navigation.state === 'loading') {
		return <LoadingState />;
	}

	const handleDateRangeChange = (days: string) => {
		setSearchParams(prev => {
			prev.set('days', days);
			return prev;
		});
	};

	return (
		<div className="p-6 max-w-6xl mx-auto">
			<div className="flex justify-between items-center mb-6">
				<h1 className="text-2xl font-bold text-brand-primary">Analytics</h1>
				<div className="flex gap-2">
					<ExportButton data={data} />
					<select
						className="rounded-md border border-gray-300 px-3 py-1.5"
						value={searchParams.get('days') || '30'}
						onChange={e => handleDateRangeChange(e.target.value)}
					>
						<option value="7">Last 7 days</option>
						<option value="30">Last 30 days</option>
						<option value="90">Last 90 days</option>
						<option value="365">Last year</option>
					</select>
				</div>
			</div>

			<div className="space-y-12">
				<InterviewPerformance stats={data.interviewStats} />
				<CandidateMetrics stats={data.candidateStats} />
				<CheckpointAnalysis stats={data.checkpointStats} />
				<OrganizationInsights stats={data.organizationStats} volumeData={data.volumeData} />
			</div>
		</div>
	);
}
