import { Link, useLoaderData } from 'react-router';
import { type LoaderFunctionArgs } from 'react-router';
import { createSupabaseServer } from '~/utils/supabase.server';

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

	// Get stats for the last 30 days
	const dateRange = new Date();
	dateRange.setDate(dateRange.getDate() - 30);

	// Get pending interviews
	const { data: pendingInterviews, error: pendingError } = await supabase
		.from('interviews')
		.select('*')
		.eq('organization_id', orgMember.organization_id)
		.eq('status', 'ready')
		.gte('created_at', dateRange.toISOString());

	// Get completed interviews
	const { data: completedInterviews, error: completedError } = await supabase
		.from('interviews')
		.select('*')
		.eq('organization_id', orgMember.organization_id)
		.eq('status', 'done')
		.gte('created_at', dateRange.toISOString());

	// Get average response time (time between creation and completion)
	const { data: responseTimeData, error: responseError } = await supabase
		.from('interviews')
		.select('created_at, updated_at')
		.eq('organization_id', orgMember.organization_id)
		.eq('status', 'done')
		.gte('created_at', dateRange.toISOString());

	if (pendingError || completedError || responseError) {
		throw new Error('Failed to load dashboard stats');
	}

	// Calculate average response time in hours
	const avgResponseTime =
		responseTimeData?.reduce((acc, interview) => {
			const created = new Date(interview.created_at);
			const updated = new Date(interview.updated_at);
			return acc + (updated.getTime() - created.getTime()) / (1000 * 60 * 60);
		}, 0) / (responseTimeData?.length || 1);

	// Calculate completion rate
	const totalInterviews = (pendingInterviews?.length || 0) + (completedInterviews?.length || 0);
	const completionRate = totalInterviews ? ((completedInterviews?.length || 0) / totalInterviews) * 100 : 0;

	// Get recent interviews
	const { data: recentInterviews, error: recentError } = await supabase
		.from('interviews')
		.select(`
			*,
			candidates:interviews_candidates(
				candidate:profiles(
					id,
					email,
					candidate_profiles(
						name
					)
				)
			)
		`)
		.eq('organization_id', orgMember.organization_id)
		.order('created_at', { ascending: false })
		.limit(5);

	if (recentError) {
		throw new Error('Failed to load recent interviews');
	}

	return {
		stats: {
			pendingCount: pendingInterviews?.length || 0,
			completionRate,
			avgResponseTime,
		},
		recentInterviews,
	};
}

export default function DashboardScreen() {
	const { stats, recentInterviews } = useLoaderData<typeof loader>();

	return (
		<div className="space-y-6">
			<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
				<div className="bg-white overflow-hidden shadow rounded-lg">
					<div className="p-5">
						<div className="flex items-center">
							<div className="flex-shrink-0 bg-brand-primary rounded-md p-3">
								<svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
									/>
								</svg>
							</div>
							<div className="ml-5 w-0 flex-1">
								<dl>
									<dt className="text-sm font-medium text-gray-500 truncate">Pending Interviews</dt>
									<dd className="flex items-baseline">
										<div className="text-2xl font-semibold text-gray-900">{stats.pendingCount}</div>
									</dd>
								</dl>
							</div>
						</div>
					</div>
					<div className="bg-brand-neutral/10 px-5 py-3">
						<Link to="/dashboard/interviews" className="text-sm font-medium text-brand-primary hover:text-brand-primary/80">
							View candidates
						</Link>
					</div>
				</div>

				<div className="bg-white overflow-hidden shadow rounded-lg">
					<div className="p-5">
						<div className="flex items-center">
							<div className="flex-shrink-0 bg-brand-primary rounded-md p-3">
								<svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
									/>
								</svg>
							</div>
							<div className="ml-5 w-0 flex-1">
								<dl>
									<dt className="text-sm font-medium text-gray-500 truncate">Completion Rate</dt>
									<dd className="flex items-baseline">
										<div className="text-2xl font-semibold text-gray-900">{Math.round(stats.completionRate)}%</div>
									</dd>
								</dl>
							</div>
						</div>
					</div>
					<div className="bg-brand-neutral/10 px-5 py-3">
						<Link to="/dashboard/analytics" className="text-sm font-medium text-brand-primary hover:text-brand-primary/80">
							View analytics
						</Link>
					</div>
				</div>

				<div className="bg-white overflow-hidden shadow rounded-lg">
					<div className="p-5">
						<div className="flex items-center">
							<div className="flex-shrink-0 bg-brand-primary rounded-md p-3">
								<svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
									<dt className="text-sm font-medium text-gray-500 truncate">Avg. Response Time</dt>
									<dd className="flex items-baseline">
										<div className="text-2xl font-semibold text-gray-900">
											{Math.round(stats.avgResponseTime * 10) / 10}h
										</div>
									</dd>
								</dl>
							</div>
						</div>
					</div>
					<div className="bg-brand-neutral/10 px-5 py-3">
						<Link to="/dashboard/analytics" className="text-sm font-medium text-brand-primary hover:text-brand-primary/80">
							View metrics
						</Link>
					</div>
				</div>
			</div>

			<div className="bg-white shadow rounded-lg">
				<div className="px-4 py-5 sm:p-6">
					<h3 className="text-lg leading-6 font-medium text-gray-900">Recent Interviews</h3>
					<div className="mt-5">
						<div className="flow-root">
							<ul className="-mb-8">
								{recentInterviews.map((interview, idx) => (
									<li key={interview.id} className="relative pb-8">
										<div className="relative flex space-x-3">
											<div>
												<span
													className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
														interview.status === 'done'
															? 'bg-brand-primary'
															: interview.status === 'ready'
																? 'bg-brand-accent'
																: 'bg-gray-400'
													}`}
												>
													{interview.status === 'done' ? (
														<svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
															<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
														</svg>
													) : interview.status === 'ready' ? (
														<svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
															<path
																strokeLinecap="round"
																strokeLinejoin="round"
																strokeWidth={2}
																d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
															/>
														</svg>
													) : (
														<svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
															<path
																strokeLinecap="round"
																strokeLinejoin="round"
																strokeWidth={2}
																d="M6 18L18 6M6 6l12 12"
															/>
														</svg>
													)}
												</span>
											</div>
											<div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
												<div>
													<p className="text-sm text-gray-500">
														{interview.status === 'done' ? 'Interview completed for ' : 'Interview scheduled for '}
														<Link
															to={`/dashboard/interviews/${interview.id}`}
															className="font-medium text-gray-900 hover:text-brand-primary"
														>
															{interview.candidates?.[0]?.candidate?.candidate_profiles?.[0]?.name || 'Unknown'} - {interview.name}
														</Link>
													</p>
												</div>
												<div className="text-right text-sm whitespace-nowrap text-gray-500">
													<time dateTime={interview.created_at}>
														{new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
															Math.round(
																(new Date(interview.created_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
															),
															'days',
														)}
													</time>
												</div>
											</div>
										</div>
										{idx < recentInterviews.length - 1 && <div className="absolute left-4 top-8 -ml-px h-full w-0.5 bg-gray-200" />}
									</li>
								))}
							</ul>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
