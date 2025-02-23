import { Dialog } from '@headlessui/react';
import React from 'react';
import { Link } from 'react-router';
import {
	type ActionFunctionArgs,
	Form,
	type LoaderFunctionArgs,
	redirect,
	useActionData,
	useLoaderData,
	useNavigate,
	useNavigation,
	useSubmit,
} from 'react-router';
import { toast } from 'sonner';
import { CandidateProfile as CandidateProfileComponent } from '~/components/CandidateProfile';
import { ErrorBoundary } from '~/components/ErrorBoundary';
import { InterviewSchedule } from '~/components/InterviewSchedule';
import { type CandidateProfile, type InterviewWithRelations } from '~/types/interview';
import { createSupabaseServer } from '~/utils/supabase.server';

export { ErrorBoundary };

export async function loader({ request, params }: LoaderFunctionArgs) {
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

	const { data: interview, error } = await supabase
		.from('interviews')
		.select('*')
		.eq('id', params.id)
		.eq('organization_id', orgMember.organization_id)
		.single();

	if (error || !interview) {
		console.error(error);
		throw new Error('Interview not found');
	}

	// Get the interview with all relations
	const { data: interviewDetails } = await supabase
		.from('interviews')
		.select(`
      *,
      candidates:interview_candidates_view!inner(*),
      invitations:interviews_invitations(*),
      interviewers:interviews_interviewers(
        id,
        interviewer_id,
        created_at,
        interviewer:profiles!interviewer_id(id, email)
      )
    `)
		.eq('id', params.id)
		.eq('organization_id', orgMember.organization_id)
		.single();

	if (!interviewDetails) {
		return { interview, role: orgMember.role };
	}

	// Transform the data to match our types
	const transformedInterview = {
		...interview,
		...interviewDetails,
		candidates: interviewDetails.candidates.map((c: any) => ({
			id: c.interview_candidate_id,
			interview_id: c.interview_id,
			candidate_id: c.candidate_id,
			created_at: c.accepted_at,
			candidate: {
				id: c.profile_id,
				email: c.email,
				candidate_profile: [
					{
						id: c.candidate_profile_id,
						profile_id: c.profile_id,
						name: c.name,
						phone: c.phone,
						title: c.title,
						experience_years: c.experience_years,
						skills: c.skills,
						bio: c.bio,
						location: c.location,
						resume_url: c.resume_url,
						resume_filename: c.resume_filename,
						created_at: c.profile_created_at,
						updated_at: c.profile_updated_at,
					},
				].filter(p => p.id), // Only include if profile exists
			},
		})),
	};

	return { interview: transformedInterview as unknown as InterviewWithRelations, role: orgMember.role };
}

export async function action({ request, params }: ActionFunctionArgs) {
	const headers = new Headers();
	const supabase = createSupabaseServer(request, headers);
	const formData = await request.formData();
	const action = formData.get('action');

	// Get the user's session first
	const {
		data: { session },
		error: sessionError,
	} = await supabase.auth.getSession();
	if (sessionError || !session) {
		throw new Error('Not authenticated');
	}

	// Get the organization first to check permissions
	const { data: orgMember, error: orgError } = await supabase
		.from('organization_members')
		.select('organization_id, role')
		.eq('user_id', session.user.id)
		.single();

	if (orgError || !orgMember || !['owner', 'admin'].includes(orgMember.role)) {
		throw new Error('Not authorized');
	}

	switch (action) {
		case 'update_status': {
			const status = formData.get('status');
			if (!status) throw new Error('Status is required');

			const { error } = await supabase
				.from('interviews')
				.update({ status })
				.eq('id', params.id)
				.eq('organization_id', orgMember.organization_id);

			if (error) {
				return { error: 'Failed to update status', success: false, action } as const;
			}
			return { success: true, action } as const;
		}

		case 'delete': {
			const { error } = await supabase
				.from('interviews')
				.delete()
				.eq('id', params.id)
				.eq('organization_id', orgMember.organization_id);

			if (error) {
				return { error: 'Failed to delete interview', success: false, action } as const;
			}
			return { success: true, action } as const;
		}

		case 'schedule': {
			const date = formData.get('date')?.toString();
			const time = formData.get('time')?.toString();
			if (!date || !time) throw new Error('Date and time are required');

			const startAt = new Date(`${date}T${time}`).toISOString();

			const { error } = await supabase
				.from('interviews')
				.update({ start_at: startAt, status: 'scheduled' })
				.eq('id', params.id)
				.eq('organization_id', orgMember.organization_id);

			if (error) {
				return { error: 'Failed to schedule interview', success: false, action } as const;
			}
			return { success: true, action } as const;
		}

		default:
			throw new Error('Invalid action');
	}
}

function LoadingState() {
	return (
		<div className="p-6 max-w-6xl mx-auto animate-pulse">
			<div className="flex justify-between items-center mb-6">
				<div>
					<div className="h-4 w-24 bg-gray-200 rounded mb-2"></div>
					<div className="h-8 w-64 bg-gray-200 rounded"></div>
				</div>
				<div className="h-8 w-32 bg-gray-200 rounded"></div>
			</div>

			<div className="bg-white rounded-lg shadow overflow-hidden">
				<div className="p-6">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div className="space-y-6">
							{[1, 2].map(i => (
								<div key={i}>
									<div className="h-6 w-32 bg-gray-200 rounded mb-3"></div>
									<div className="space-y-2">
										<div className="h-4 w-48 bg-gray-200 rounded"></div>
										<div className="h-4 w-40 bg-gray-200 rounded"></div>
									</div>
								</div>
							))}
						</div>

						<div className="space-y-6">
							{[1, 2].map(i => (
								<div key={i}>
									<div className="h-6 w-32 bg-gray-200 rounded mb-3"></div>
									<div className="space-y-2">
										<div className="h-4 w-48 bg-gray-200 rounded"></div>
										<div className="h-4 w-40 bg-gray-200 rounded"></div>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

function InterviewStatus({
	status,
	onUpdate,
}: { status: InterviewWithRelations['status']; onUpdate?: (status: InterviewWithRelations['status']) => void }) {
	const getStatusStyle = () => {
		switch (status) {
			case 'ready':
				return {
					bg: 'bg-gray-300',
					text: 'text-gray-800',
					icon: (
						<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
						</svg>
					),
				};
			case 'scheduled':
				return {
					bg: 'bg-yellow-100',
					text: 'text-yellow-800',
					icon: (
						<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
							/>
						</svg>
					),
				};
			case 'confirmed':
				return {
					bg: 'bg-green-100',
					text: 'text-green-800',
					icon: (
						<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
						</svg>
					),
				};
			case 'canceled':
				return {
					bg: 'bg-red-100',
					text: 'text-red-800',
					icon: (
						<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
						</svg>
					),
				};
			case 'done':
				return {
					bg: 'bg-blue-100',
					text: 'text-blue-800',
					icon: (
						<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
							/>
						</svg>
					),
				};
			default:
				return {
					bg: 'bg-gray-100',
					text: 'text-gray-800',
					icon: null,
				};
		}
	};

	const style = getStatusStyle();

	if (!onUpdate) {
		return (
			<span
				className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-sm font-medium ${style.bg} ${style.text}`}
			>
				{style.icon}
				{status.charAt(0).toUpperCase() + status.slice(1)}
			</span>
		);
	}

	const statusOptions = [
		{
			value: 'ready',
			label: 'Ready',
			bg: 'bg-gray-300',
			text: 'text-gray-800',
			icon: (
				<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
				</svg>
			),
		},
		{
			value: 'scheduled',
			label: 'Scheduled',
			bg: 'bg-yellow-100',
			text: 'text-yellow-800',
			icon: (
				<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
					/>
				</svg>
			),
		},
		{
			value: 'confirmed',
			label: 'Confirmed',
			bg: 'bg-green-100',
			text: 'text-green-800',
			icon: (
				<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
				</svg>
			),
		},
		{
			value: 'canceled',
			label: 'Canceled',
			bg: 'bg-red-100',
			text: 'text-red-800',
			icon: (
				<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
				</svg>
			),
		},
		{
			value: 'done',
			label: 'Done',
			bg: 'bg-blue-100',
			text: 'text-blue-800',
			icon: (
				<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
					/>
				</svg>
			),
		},
	];

	return (
		<Form method="post" className="inline-block">
			<input type="hidden" name="action" value="update_status" />
			<div className="relative">
				<select
					name="status"
					value={status}
					onChange={e => onUpdate(e.target.value as InterviewWithRelations['status'])}
					className={`appearance-none ${style.bg} ${style.text} pl-8 pr-8 py-1.5 rounded-full text-sm font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 [&>*]:bg-white`}
				>
					{statusOptions.map(option => (
						<option
							key={option.value}
							value={option.value}
							className={`flex items-center gap-2 px-3 py-2 ${option.bg} ${option.text} hover:opacity-80`}
						>
							{option.label}
						</option>
					))}
				</select>
				<div className="pointer-events-none absolute inset-y-0 left-2 flex items-center">{style.icon}</div>
				<div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
					<svg className="w-4 h-4 text-current opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
					</svg>
				</div>
			</div>
		</Form>
	);
}

export default function InterviewScreen() {
	const { interview, role } = useLoaderData<typeof loader>();
	const navigation = useNavigation();
	const submit = useSubmit();
	const actionData = useActionData<typeof action>();
	const navigate = useNavigate();
	const [selectedCandidateId, setSelectedCandidateId] = React.useState<string | null>(null);

	React.useEffect(() => {
		if (actionData?.success) {
			switch (actionData.action) {
				case 'update_status':
					toast.success('Interview status has been updated');
					break;
				case 'delete':
					toast.success('Interview has been deleted');
					navigate('/dashboard/interviews');
					break;
				case 'schedule':
					toast.success('Interview has been scheduled');
					break;
			}
		} else if (actionData?.error) {
			toast.error(actionData.error);
		}
	}, [actionData, navigate]);

	if (navigation.state === 'loading') {
		return <LoadingState />;
	}

	const canManage = role === 'owner' || role === 'admin';
	const handleStatusUpdate = (status: InterviewWithRelations['status']) => {
		const formData = new FormData();
		formData.set('action', 'update_status');
		formData.set('status', status);
		submit(formData, { method: 'post' });
	};

	const handleSchedule = (dateTime: string) => {
		const [date, time] = dateTime.split('T');
		const formData = new FormData();
		formData.set('action', 'schedule');
		formData.set('date', date);
		formData.set('time', time);
		submit(formData, { method: 'post' });
	};

	const selectedCandidate = interview.candidates?.find(c => c.candidate.id === selectedCandidateId);
	console.log(selectedCandidate);
	console.log(interview.candidates);

	return (
		<div className="p-6 max-w-6xl mx-auto">
			<div className="flex justify-between items-center mb-6">
				<div>
					<Link to="/dashboard/interviews" className="text-gray-600 hover:text-gray-800 mb-2 inline-block">
						← Back to Interviews
					</Link>
					<h1 className="text-2xl font-bold text-gray-700">{interview.name}</h1>
					{interview.description && <p className="text-gray-600 mt-1">{interview.description}</p>}
				</div>
				<div className="flex items-center gap-4">
					<InterviewStatus status={interview.status} onUpdate={canManage ? handleStatusUpdate : undefined} />
					{canManage && (
						<Form
							method="post"
							onSubmit={(e: React.FormEvent) => {
								if (!confirm('Are you sure you want to delete this interview?')) {
									e.preventDefault();
								}
							}}
						>
							<input type="hidden" name="action" value="delete" />
							<button type="submit" className="text-red-600 hover:text-red-800">
								Delete
							</button>
						</Form>
					)}
				</div>
			</div>

			<div className="bg-white rounded-lg shadow overflow-hidden">
				<div className="p-6">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div>
							<section className="mb-6">
								<InterviewSchedule interview={interview} canEdit={canManage} onSchedule={handleSchedule} />
							</section>

							<section className="mb-6">
								<h2 className="text-lg font-semibold text-gray-700 mb-3">Interviewers</h2>
								<div className="space-y-2">
									{interview.interviewers?.map(interviewer => (
										<div key={interviewer.interviewer.id} className="text-gray-700">
											{interviewer.interviewer.email}
										</div>
									))}
								</div>
							</section>
						</div>

						<div>
							<section className="mb-6">
								<h2 className="text-lg font-semibold text-gray-700 mb-3">Candidates</h2>
								<div className="space-y-4">
									<div>
										<h3 className="text-sm font-medium text-gray-600 mb-2">
											Accepted ({interview.candidates?.length || 0})
										</h3>
										<div className="space-y-2">
											{interview.candidates?.map(candidate => (
												<div key={candidate.candidate.id} className="flex items-center justify-between text-gray-700">
													<span>{candidate.candidate.email}</span>
													<button
														onClick={() => setSelectedCandidateId(candidate.candidate.id)}
														className="text-brand-primary hover:text-brand-primary-dark text-sm"
													>
														View Profile
													</button>
												</div>
											))}
										</div>
									</div>

									<div>
										<h3 className="text-sm font-medium text-gray-600 mb-2">
											Invited ({interview.invitations?.filter(i => i.status === 'pending').length || 0})
										</h3>
										<div className="space-y-2">
											{interview.invitations
												?.filter(i => i.status === 'pending')
												.map(invitation => (
													<div key={invitation.id} className="text-gray-700">
														{invitation.email}
													</div>
												))}
										</div>
									</div>

									<div>
										<h3 className="text-sm font-medium text-gray-600 mb-2">
											Declined ({interview.invitations?.filter(i => i.status === 'declined').length || 0})
										</h3>
										<div className="space-y-2">
											{interview.invitations
												?.filter(i => i.status === 'declined')
												.map(invitation => (
													<div key={invitation.id} className="text-gray-700">
														{invitation.email}
													</div>
												))}
										</div>
									</div>
								</div>
							</section>

							{canManage && (
								<section>
									<Link
										to={`/dashboard/interviews/${interview.id}/invite`}
										className="inline-flex items-center text-blue-600 hover:text-blue-800"
									>
										Invite Candidates →
									</Link>
								</section>
							)}
						</div>
					</div>
				</div>
			</div>

			<Dialog
				open={selectedCandidateId !== null}
				onClose={() => setSelectedCandidateId(null)}
				className="fixed inset-0 z-50 overflow-y-auto"
			>
				<div className="flex items-center justify-center min-h-screen">
					<div className="fixed inset-0 bg-black opacity-30" />

					<div className="relative bg-white rounded-lg max-w-2xl w-full mx-4 my-8">
						<div className="absolute top-0 right-0 pt-4 pr-4">
							<button
								type="button"
								className="text-gray-400 hover:text-gray-500"
								onClick={() => setSelectedCandidateId(null)}
							>
								<span className="sr-only">Close</span>
								<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
								</svg>
							</button>
						</div>

						<div className="p-6">
							<Dialog.Title className="text-lg font-medium text-gray-900 mb-4">Candidate Profile</Dialog.Title>
							{selectedCandidateId && (
								<>
									{(() => {
										const profile = interview.candidates?.find(c => c.candidate.id === selectedCandidateId)?.candidate
											.candidate_profile?.[0];
										if (!profile) return <div className="text-gray-500">No profile information available</div>;
										return <CandidateProfileComponent profile={profile} />;
									})()}
								</>
							)}
						</div>
					</div>
				</div>
			</Dialog>
		</div>
	);
}
