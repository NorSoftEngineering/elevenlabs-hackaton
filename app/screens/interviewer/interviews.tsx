import { Link } from 'react-router';
import { type LoaderFunctionArgs, useLoaderData, useNavigate, useNavigation } from 'react-router';
import { ErrorBoundary } from '~/components/ErrorBoundary';
import { type InterviewWithRelations } from '~/types';
import { createSupabaseServer } from '~/utils/supabase.server';

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

	// Get all interviews for the organization
	const { data: interviews, error } = await supabase
		.from('interviews')
		.select(`
      *,
      candidates:interviews_candidates(*),
      invitations:interviews_invitations(*),
      interviewers:interviews_interviewers(*)
    `)
		.eq('organization_id', orgMember.organization_id)
		.order('created_at', { ascending: false });

	if (error) {
		throw new Error('Failed to load interviews');
	}

	return { interviews: interviews as unknown as InterviewWithRelations[], role: orgMember.role };
}

function LoadingState() {
	return (
		<div className="p-6 max-w-6xl mx-auto animate-pulse">
			<div className="flex justify-between items-center mb-6">
				<div className="h-8 w-32 bg-gray-200 rounded"></div>
				<div className="h-10 w-32 bg-gray-200 rounded"></div>
			</div>

			<div className="bg-white rounded-lg shadow overflow-hidden">
				<div className="divide-y divide-gray-200">
					{[1, 2, 3].map(i => (
						<div key={i} className="p-6">
							<div className="h-6 w-48 bg-gray-200 rounded mb-2"></div>
							<div className="h-4 w-32 bg-gray-200 rounded"></div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}

function EmptyState() {
	return (
		<div className="p-6 max-w-6xl mx-auto">
			<div className="flex justify-between items-center mb-6">
				<h1 className="text-2xl font-bold text-brand-primary">Interviews</h1>
				<Link to="/dashboard/interviews/new" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
					Create Interview
				</Link>
			</div>

			<div className="bg-white rounded-lg shadow overflow-hidden">
				<div className="p-12 text-center">
					<div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
						<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
							/>
						</svg>
					</div>
					<h2 className="text-xl font-semibold text-gray-900 mb-2">No interviews yet</h2>
					<p className="text-gray-600 mb-6">Create your first interview to get started.</p>
					<Link to="/dashboard/interviews/new" className="inline-flex items-center text-blue-600 hover:text-blue-800">
						Create Interview →
					</Link>
				</div>
			</div>
		</div>
	);
}

function InterviewStatus({ status }: { status: InterviewWithRelations['status'] }) {
	const getStatusStyle = () => {
		switch (status) {
			case 'ready':
				return 'bg-gray-100 text-gray-800';
			case 'scheduled':
				return 'bg-yellow-100 text-yellow-800';
			case 'confirmed':
				return 'bg-green-100 text-green-800';
			case 'canceled':
				return 'bg-red-100 text-red-800';
			case 'done':
				return 'bg-blue-100 text-blue-800';
			default:
				return 'bg-gray-100 text-gray-800';
		}
	};

	return (
		<span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusStyle()}`}>
			{status.charAt(0).toUpperCase() + status.slice(1)}
		</span>
	);
}

export default function InterviewsScreen() {
	const { interviews, role } = useLoaderData<typeof loader>();
	const navigation = useNavigation();
	const navigate = useNavigate();

	if (navigation.state === 'loading') {
		return <LoadingState />;
	}

	if (!interviews.length) {
		return <EmptyState />;
	}

	const canCreateInterview = role === 'owner' || role === 'admin';

	return (
		<div className="p-6 max-w-6xl mx-auto">
			<div className="flex justify-between items-center mb-6">
				<h1 className="text-2xl font-bold text-brand-primary">Interviews</h1>
				{canCreateInterview && (
					<Link
						to="/dashboard/interviews/new"
						className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
					>
						Create Interview
					</Link>
				)}
			</div>

			<div className="bg-white rounded-lg shadow overflow-hidden">
				<table className="min-w-full divide-y divide-gray-200">
					<thead className="bg-gray-50">
						<tr>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Duration
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Candidates
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
						</tr>
					</thead>
					<tbody className="bg-white divide-y divide-gray-200">
						{interviews.map(interview => (
							<tr
								key={interview.id}
								onClick={() => navigate(`/dashboard/interviews/${interview.id}`)}
								className="cursor-pointer hover:bg-gray-50"
							>
								<td className="px-6 py-4 whitespace-nowrap">
									<div className="text-sm font-medium text-gray-900">{interview.name}</div>
									{interview.description && <div className="text-sm text-gray-500">{interview.description}</div>}
								</td>
								<td className="px-6 py-4 whitespace-nowrap">
									<div className="text-sm text-gray-900">
										{interview.start_at ? new Date(interview.start_at).toLocaleDateString() : 'Not scheduled'}
									</div>
								</td>
								<td className="px-6 py-4 whitespace-nowrap">
									<div className="text-sm text-gray-900">{interview.duration}</div>
								</td>
								<td className="px-6 py-4 whitespace-nowrap">
									<div className="text-sm text-gray-900">
										{interview.candidates?.length || 0} / {interview.invitations?.length || 0}
									</div>
								</td>
								<td className="px-6 py-4 whitespace-nowrap">
									<InterviewStatus status={interview.status} />
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}
