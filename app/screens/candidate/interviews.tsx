import { Link } from 'react-router';
import {
	type ActionFunctionArgs,
	Form,
	type LoaderFunctionArgs,
	useLoaderData,
	useNavigation,
	useSubmit,
	useFetcher,
} from 'react-router';
import { ErrorBoundary } from '~/components/ErrorBoundary';
import { InterviewSchedule } from '~/components/InterviewSchedule';
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

	// Get pending invitations
	const { data: pendingInvitations, error: pendingError } = await supabase
		.from('candidate_invitations')
		.select('*')
		.eq('status', 'pending')
		.eq('email', session.user.email)
		.order('invited_at', { ascending: false })
		.limit(10);

	if (pendingError) {
		console.error(pendingError);
		throw new Error('Failed to load pending invitations');
	}

	// Get accepted interviews
	const { data: acceptedInterviews, error: acceptedError } = await supabase
		.from('candidate_interviews')
		.select('*')
		.eq('candidate_id', session.user.id);

	if (acceptedError) {
		throw new Error('Failed to load accepted interviews');
	}

	// Get declined invitations
	const { data: declinedInvitations, error: declinedError } = await supabase
		.from('candidate_invitations')
		.select('*')
		.eq('status', 'declined')
		.eq('email', session.user.email);

	if (declinedError) {
		throw new Error('Failed to load declined invitations');
	}

	return {
		pendingInvitations,
		acceptedInterviews,
		declinedInvitations,
	};
}

export async function action({ request }: ActionFunctionArgs) {
	const headers = new Headers();
	const supabase = createSupabaseServer(request, headers);
	const formData = await request.formData();
	const action = formData.get('action');
	const invitationId = formData.get('invitationId')?.toString();

	console.log('Action called with:', { action, invitationId });

	if (!invitationId) {
		throw new Error('Invitation ID is required');
	}

	// Get the user's session first
	const {
		data: { session },
		error: sessionError,
	} = await supabase.auth.getSession();
	if (sessionError || !session) {
		throw new Error('Not authenticated');
	}

	switch (action) {
		case 'accept': {
			console.log('Starting accept action for invitation:', invitationId);
			// Get the invitation first to get the interview_id
			const { data: invitation, error: invitationError } = await supabase
				.from('candidate_invitations')
				.select('interview_id')
				.eq('id', invitationId)
				.eq('email', session.user.email)
				.single();

			if (invitationError || !invitation) {
				console.error('Failed to get invitation:', invitationError);
				throw new Error('Failed to get invitation');
			}

			console.log('Found invitation:', invitation);

			// Start a transaction by using .rpc()
			const { error: acceptError } = await supabase.rpc('accept_interview_invitation', {
				p_invitation_id: invitationId,
				p_candidate_id: session.user.id,
			});

			if (acceptError) {
				console.error('Failed to accept invitation:', acceptError);
				throw new Error('Failed to accept invitation');
			}

			console.log('Successfully accepted invitation');
			break;
		}

		case 'decline': {
			const { error } = await supabase
				.from('candidate_invitations')
				.update({ status: 'declined', responded_at: new Date().toISOString() })
				.eq('id', invitationId)
				.eq('email', session.user.email);

			if (error) throw new Error('Failed to decline invitation');
			break;
		}

		case 'schedule': {
			const date = formData.get('date')?.toString();
			const time = formData.get('time')?.toString();
			if (!date || !time) throw new Error('Date and time are required');

			const startAt = new Date(`${date}T${time}`).toISOString();

			// Get the invitation first to get the interview_id
			const { data: invitation, error: invitationError } = await supabase
				.from('candidate_invitations')
				.select('interview_id')
				.eq('id', invitationId)
				.eq('email', session.user.email)
				.single();

			if (invitationError || !invitation) {
				throw new Error('Failed to get invitation');
			}

			// Update the interview start time
			const { error: scheduleError } = await supabase
				.from('interviews')
				.update({ start_at: startAt })
				.eq('id', invitation.interview_id);

			if (scheduleError) throw new Error('Failed to schedule interview');
			break;
		}

		case 'reschedule': {
			const date = formData.get('date')?.toString();
			const time = formData.get('time')?.toString();
			if (!date || !time) throw new Error('Date and time are required');

			const startAt = new Date(`${date}T${time}`).toISOString();

			// Start a transaction by using .rpc()
			const { error: rescheduleError } = await supabase.rpc('reschedule_interview_invitation', {
				p_invitation_id: invitationId,
				p_candidate_id: session.user.id,
				p_start_at: startAt,
			});

			if (rescheduleError) throw new Error('Failed to reschedule interview');
			break;
		}

		default:
			throw new Error('Invalid action');
	}

	return null;
}

function LoadingState() {
	return (
		<div className="p-6 max-w-6xl mx-auto animate-pulse">
			<div className="h-8 w-32 bg-gray-200 rounded mb-6"></div>
			<div className="space-y-6">
				{[1, 2, 3].map(i => (
					<div key={i} className="bg-white rounded-lg shadow overflow-hidden">
						<div className="p-6">
							<div className="h-6 w-48 bg-gray-200 rounded mb-4"></div>
							<div className="space-y-2">
								<div className="h-4 w-32 bg-gray-200 rounded"></div>
								<div className="h-4 w-24 bg-gray-200 rounded"></div>
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

export default function InterviewsScreen() {
	const { pendingInvitations, acceptedInterviews, declinedInvitations } = useLoaderData<typeof loader>();
	const navigation = useNavigation();
	const fetcher = useFetcher();

	// Disable the button while submitting
	const isAccepting = fetcher.state === 'submitting' && fetcher.formData?.get('action') === 'accept';

	const handleReschedule = (invitationId: string, dateTime: string) => {
		const [date, time] = dateTime.split('T');
		const formData = new FormData();
		formData.set('action', 'reschedule');
		formData.set('invitationId', invitationId);
		formData.set('date', date);
		formData.set('time', time);
		fetcher.submit(formData, { method: 'post' });
	};

	if (navigation.state === 'loading') {
		return <LoadingState />;
	}

	return (
		<div className="p-6 max-w-6xl mx-auto">
			<h1 className="text-2xl font-bold text-gray-700 mb-6">My Interviews</h1>

			{pendingInvitations.length > 0 && (
				<section className="mb-8">
					<h2 className="text-lg font-semibold text-gray-700 mb-4">Pending Invitations</h2>
					<div className="space-y-4">
						{pendingInvitations.map(invitation => (
							<div key={invitation.id} className="bg-white rounded-lg shadow overflow-hidden">
								<div className="p-6">
									<div className="space-y-4">
										<div className="flex justify-between items-start">
											<div>
												<h3 className="text-lg font-medium text-gray-900">{invitation.interview_name}</h3>
												<p className="text-sm text-gray-600 mt-1">{invitation.organization_name}</p>
												{invitation.interview_description && (
													<p className="text-sm text-gray-600 mt-2">{invitation.interview_description}</p>
												)}
												<div className="mt-2 text-sm text-gray-600">
													<p>Duration: {invitation.interview_duration}</p>
												</div>
											</div>
											<div className="flex gap-2">
												<fetcher.Form method="post">
													<input type="hidden" name="action" value="accept" />
													<input type="hidden" name="invitationId" value={invitation.id} />
													<button
														type="submit"
														disabled={isAccepting}
														className={`inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${isAccepting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
													>
														{isAccepting ? 'Accepting...' : 'Accept'}
													</button>
												</fetcher.Form>
												<fetcher.Form method="post">
													<input type="hidden" name="action" value="decline" />
													<input type="hidden" name="invitationId" value={invitation.id} />
													<button
														type="submit"
														className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
													>
														Decline
													</button>
												</fetcher.Form>
											</div>
										</div>
										
										<InterviewSchedule
											interview={{
												...invitation,
												start_at: invitation.interview_start_at,
											} as InterviewWithRelations}
											canEdit={true}
											onSchedule={(dateTime) => handleReschedule(invitation.id, dateTime)}
										/>
									</div>
								</div>
							</div>
						))}
					</div>
				</section>
			)}

			{acceptedInterviews.length > 0 && (
				<section className="mb-8">
					<h2 className="text-lg font-semibold text-gray-700 mb-4">Upcoming Interviews</h2>
					<div className="space-y-4">
						{acceptedInterviews.map(accepted => (
							<div key={accepted.id} className="bg-white rounded-lg shadow overflow-hidden">
								<div className="p-6">
									<div className="flex justify-between items-start">
										<div>
											<h3 className="text-lg font-medium text-gray-900">{accepted.interview_name}</h3>
											<p className="text-sm text-gray-600 mt-1">{accepted.organization_name}</p>
											{accepted.interview_description && (
												<p className="text-sm text-gray-600 mt-2">{accepted.interview_description}</p>
											)}
											<div className="mt-2 text-sm text-gray-600">
												<p>Duration: {accepted.interview_duration}</p>
												{accepted.interview_start_at && (
													<p>Scheduled for: {new Date(accepted.interview_start_at).toLocaleString()}</p>
												)}
											</div>
										</div>
										<Link
											to={`/candidate/interviews/${accepted.interview_id}`}
											className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
										>
											View Details
										</Link>
									</div>
								</div>
							</div>
						))}
					</div>
				</section>
			)}

			{declinedInvitations.length > 0 && (
				<section>
					<h2 className="text-lg font-semibold text-gray-700 mb-4">Past Invitations</h2>
					<div className="space-y-4">
						{declinedInvitations.map(invitation => (
							<div key={invitation.id} className="bg-white rounded-lg shadow overflow-hidden opacity-75">
								<div className="p-6">
									<div className="flex justify-between items-start">
										<div>
											<h3 className="text-lg font-medium text-gray-900">{invitation.interview_name}</h3>
											<p className="text-sm text-gray-600 mt-1">{invitation.organization_name}</p>
											{invitation.interview_description && (
												<p className="text-sm text-gray-600 mt-2">{invitation.interview_description}</p>
											)}
											<div className="mt-2 text-sm text-gray-600">
												<p>Duration: {invitation.interview_duration}</p>
												{invitation.interview_start_at && (
													<p>Scheduled for: {new Date(invitation.interview_start_at).toLocaleString()}</p>
												)}
											</div>
											<p className="text-sm text-red-600 mt-2">
												Declined on {new Date(invitation.responded_at!).toLocaleDateString()}
											</p>
										</div>
									</div>
								</div>
							</div>
						))}
					</div>
				</section>
			)}

			{!pendingInvitations.length && !acceptedInterviews.length && !declinedInvitations.length && (
				<div className="text-center py-12">
					<h3 className="text-lg font-medium text-gray-900 mb-2">No interviews yet</h3>
					<p className="text-gray-600">You'll see your interview invitations and scheduled interviews here.</p>
				</div>
			)}
		</div>
	);
}
