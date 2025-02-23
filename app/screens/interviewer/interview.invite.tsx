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
} from 'react-router';
import { toast } from 'sonner';
import { ErrorBoundary } from '~/components/ErrorBoundary';
import { type InterviewWithRelations } from '~/types';
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

	if (!['owner', 'admin'].includes(orgMember.role)) {
		throw new Error('Not authorized');
	}

	// Get the interview with all relations
	const { data: interview, error } = await supabase
		.from('interviews')
		.select(`
      *,
      candidates:interviews_candidates(
        id,
        interview_id,
        candidate_id,
        created_at,
        candidate:profiles!candidate_id(id, email)
      ),
      invitations:interviews_invitations(*)
    `)
		.eq('id', params.id)
		.eq('organization_id', orgMember.organization_id)
		.single();

	if (error || !interview) {
		throw new Error('Interview not found');
	}

	return { interview: interview as unknown as InterviewWithRelations };
}

export async function action({ request, params }: ActionFunctionArgs) {
	const headers = new Headers();
	const supabase = createSupabaseServer(request, headers);
	const formData = await request.formData();

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

	if (orgError || !orgMember || !['owner', 'admin'].includes(orgMember.role)) {
		throw new Error('Not authorized');
	}

	const emails = formData
		.get('emails')
		?.toString()
		.split(',')
		.map(email => email.trim())
		.filter(Boolean);

	if (!emails?.length) {
		return { error: 'At least one email is required', success: false } as const;
	}

	// Validate email format
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	const invalidEmails = emails.filter(email => !emailRegex.test(email));
	if (invalidEmails.length) {
		return { error: `Invalid email format: ${invalidEmails.join(', ')}`, success: false } as const;
	}

	// Check if any of the emails are already invited
	const { data: existingInvitations, error: invitationsError } = await supabase
		.from('interviews_invitations')
		.select('email')
		.eq('interview_id', params.id)
		.in('email', emails);

	if (invitationsError) {
		return { error: 'Failed to check existing invitations', success: false } as const;
	}

	const alreadyInvited = existingInvitations?.map(i => i.email);
	if (alreadyInvited?.length) {
		return { error: `Some emails are already invited: ${alreadyInvited.join(', ')}`, success: false } as const;
	}

	// Create invitations
	const invitations = emails.map(email => ({
		interview_id: params.id,
		email,
		status: 'pending',
	}));

	const { data: createdInvitations, error } = await supabase
		.from('interviews_invitations')
		.insert(invitations)
		.select();

	if (error) {
		return { error: 'Failed to create invitations', success: false } as const;
	}

	// Call webhook
	try {
		await fetch(`https://hook.eu2.make.com/4u0brjktjwfm18k5hj78pojv009s61fx`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				interviewId: params.id,
				invitations: createdInvitations,
				invited_by: session.user.id,
				organization_id: orgMember.organization_id,
			}),
		});
	} catch (webhookError) {
		console.error('Failed to call webhook:', webhookError);
	}

	return { success: true, count: emails.length };
}

function LoadingState() {
	return (
		<div className="p-6 max-w-4xl mx-auto animate-pulse">
			<div className="flex justify-between items-center mb-6">
				<div className="h-8 w-32 bg-gray-200 rounded"></div>
			</div>

			<div className="bg-white rounded-lg shadow overflow-hidden">
				<div className="p-6">
					<div className="space-y-4">
						<div className="h-4 w-24 bg-gray-200 rounded mb-2"></div>
						<div className="h-32 bg-gray-200 rounded"></div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default function InterviewInviteScreen() {
	const { interview } = useLoaderData<typeof loader>();
	const actionData = useActionData<typeof action>();
	const navigation = useNavigation();
	const navigate = useNavigate();

	React.useEffect(() => {
		if (actionData?.success) {
			toast.success(`Successfully invited ${actionData.count} candidate${actionData.count > 1 ? 's' : ''}`);
			navigate(`/dashboard/interviews/${interview.id}`);
		} else if (actionData?.error) {
			toast.error(actionData.error);
		}
	}, [actionData, navigate, interview.id]);

	if (navigation.state === 'loading') {
		return <LoadingState />;
	}

	return (
		<div className="p-6 max-w-4xl mx-auto">
			<div className="flex justify-between items-center mb-6">
				<div>
					<Link
						to={`/dashboard/interviews/${interview.id}`}
						className="text-gray-600 hover:text-gray-800 mb-2 inline-block"
					>
						← Back to Interview
					</Link>
					<h1 className="text-2xl font-bold text-gray-700">Invite Candidates</h1>
				</div>
			</div>

			<div className="bg-white rounded-lg shadow overflow-hidden">
				<Form method="post" className="p-6">
					{actionData?.error && (
						<div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
							<p className="text-sm text-red-600">{actionData.error}</p>
						</div>
					)}

					<div className="space-y-4">
						<div>
							<label htmlFor="emails" className="block text-sm font-medium text-gray-700">
								Email Addresses
							</label>
							<p className="text-sm text-gray-500 mb-2">Enter email addresses separated by commas</p>
							<textarea
								name="emails"
								id="emails"
								rows={4}
								required
								className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-gray-700"
								placeholder="email1@example.com, email2@example.com"
							/>
						</div>

						<div className="pt-4">
							<button
								type="submit"
								className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
							>
								Send Invitations
							</button>
						</div>
					</div>
				</Form>
			</div>
		</div>
	);
}
