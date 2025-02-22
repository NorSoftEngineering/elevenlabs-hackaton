import { Link } from 'react-router';

export default function DashboardScreen() {
	return (
		<div className="space-y-6">
			<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
				<div className="bg-white overflow-hidden shadow rounded-lg">
					<div className="p-5">
						<div className="flex items-center">
							<div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
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
										<div className="text-2xl font-semibold text-gray-900">42</div>
										<div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
											<span>+15% this week</span>
										</div>
									</dd>
								</dl>
							</div>
						</div>
					</div>
					<div className="bg-gray-50 px-5 py-3">
						<Link to="/interviews" className="text-sm font-medium text-indigo-700 hover:text-indigo-900">
							View candidates
						</Link>
					</div>
				</div>

				<div className="bg-white overflow-hidden shadow rounded-lg">
					<div className="p-5">
						<div className="flex items-center">
							<div className="flex-shrink-0 bg-green-500 rounded-md p-3">
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
									<dt className="text-sm font-medium text-gray-500 truncate">Pass Rate</dt>
									<dd className="flex items-baseline">
										<div className="text-2xl font-semibold text-gray-900">68%</div>
										<div className="ml-2 flex items-baseline text-sm font-semibold text-yellow-600">
											<span>-2% vs last month</span>
										</div>
									</dd>
								</dl>
							</div>
						</div>
					</div>
					<div className="bg-gray-50 px-5 py-3">
						<Link to="/analytics" className="text-sm font-medium text-indigo-700 hover:text-indigo-900">
							View analytics
						</Link>
					</div>
				</div>

				<div className="bg-white overflow-hidden shadow rounded-lg">
					<div className="p-5">
						<div className="flex items-center">
							<div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
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
										<div className="text-2xl font-semibold text-gray-900">2.4h</div>
										<div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
											<span>-30min vs goal</span>
										</div>
									</dd>
								</dl>
							</div>
						</div>
					</div>
					<div className="bg-gray-50 px-5 py-3">
						<Link to="/performance" className="text-sm font-medium text-indigo-700 hover:text-indigo-900">
							View metrics
						</Link>
					</div>
				</div>
			</div>

			<div className="bg-white shadow rounded-lg">
				<div className="px-4 py-5 sm:p-6">
					<h3 className="text-lg leading-6 font-medium text-gray-900">Recent Screenings</h3>
					<div className="mt-5">
						<div className="flow-root">
							<ul className="-mb-8">
								<li className="relative pb-8">
									<div className="relative flex space-x-3">
										<div>
											<span className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center ring-8 ring-white">
												<svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
												</svg>
											</span>
										</div>
										<div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
											<div>
												<p className="text-sm text-gray-500">
													Interview completed for{' '}
													<span className="font-medium text-gray-900">Sarah Chen - Senior Frontend Engineer</span>
												</p>
											</div>
											<div className="text-right text-sm whitespace-nowrap text-gray-500">
												<time dateTime="2024-02-22">30 mins ago</time>
											</div>
										</div>
									</div>
								</li>
								<li className="relative pb-8">
									<div className="relative flex space-x-3">
										<div>
											<span className="h-8 w-8 rounded-full bg-yellow-500 flex items-center justify-center ring-8 ring-white">
												<svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth={2}
														d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
													/>
												</svg>
											</span>
										</div>
										<div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
											<div>
												<p className="text-sm text-gray-500">
													Manual review needed for{' '}
													<span className="font-medium text-gray-900">Alex Kim - DevOps Engineer</span>
												</p>
											</div>
											<div className="text-right text-sm whitespace-nowrap text-gray-500">
												<time dateTime="2024-02-22">1 hour ago</time>
											</div>
										</div>
									</div>
								</li>
							</ul>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
