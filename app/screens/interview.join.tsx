import type { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router';
import { redirect, Form, useActionData, useLoaderData, useNavigation } from 'react-router';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { createSupabaseServer } from '~/utils/supabase.server';

interface LoaderData {
	invitation: {
		invitation_id: string;
		interview_id: string;
		email: string;
		status: string;
		is_expired: boolean;
	};
	interview: {
		name: string;
		description: string;
		organization_id: string;
	};
	isAuthenticated: boolean;
	userEmail: string | undefined;
}

interface ActionData {
	error?: string;
	success?: boolean;
}

export async function loader({ request, params }: LoaderFunctionArgs) {
	const headers = new Headers();
	const supabase = createSupabaseServer(request, headers);
	const token = params.token;

	if (!token) {
		throw new Error('Invalid invitation link');
	}

	// Validate the token
	const { data: invitation, error } = await supabase.rpc('validate_invitation_token', {
		p_token: token,
	});

	if (error || !invitation?.length) {
		throw new Error('Invalid or expired invitation link');
	}

	const [inviteData] = invitation;
	if (inviteData.is_expired) {
		throw new Error('This invitation has expired');
	}

	if (inviteData.status !== 'pending') {
		throw new Error('This invitation has already been used');
	}

	// Get the interview details
	const { data: interview, error: interviewError } = await supabase
		.from('interviews')
		.select('name, description, organization_id')
		.eq('id', inviteData.interview_id)
		.single();

	if (interviewError || !interview) {
		throw new Error('Interview not found');
	}

	// Check if user is already logged in
	const {
		data: { session },
	} = await supabase.auth.getSession();

	return {
		invitation: inviteData,
		interview,
		isAuthenticated: !!session,
		userEmail: session?.user?.email,
	} as const;
}

export async function action({ request, params }: ActionFunctionArgs) {
	const headers = new Headers();
	const supabase = createSupabaseServer(request, headers);
	const formData = await request.formData();
	const action = formData.get('action');

	// Get current session
	const {
		data: { session },
		error: sessionError,
	} = await supabase.auth.getSession();

	if (sessionError) {
		return { error: 'Authentication error', status: 401 } as const;
	}

	switch (action) {
		case 'accept': {
			if (!session) {
				return { error: 'Not authenticated', status: 401 } as const;
			}

			const token = params.token;
			if (!token) {
				return { error: 'Invalid invitation', status: 400 } as const;
			}

			// Validate token again
			const { data: invitation, error: validationError } = await supabase.rpc('validate_invitation_token', {
				p_token: token,
			});

			if (validationError || !invitation?.length) {
				return { error: 'Invalid or expired invitation', status: 400 } as const;
			}

			const [inviteData] = invitation;
			if (inviteData.is_expired) {
				return { error: 'This invitation has expired', status: 400 } as const;
			}

			if (inviteData.status !== 'pending') {
				return { error: 'This invitation has already been used', status: 400 } as const;
			}

			// Accept the invitation
			const { error: acceptError } = await supabase.rpc('accept_interview_invitation', {
				p_invitation_id: inviteData.invitation_id,
				p_candidate_id: session.user.id,
			});

			if (acceptError) {
				return { error: 'Failed to accept invitation', status: 500 } as const;
			}

			return redirect('/candidate/interviews');
		}

		default:
			return { error: 'Invalid action', status: 400 } as const;
	}
}

export default function JoinInterviewPage() {
	const { invitation, interview, isAuthenticated, userEmail } = useLoaderData<typeof loader>();
	const actionData = useActionData<typeof action>();
	const navigation = useNavigation();

	useEffect(() => {
		if (actionData?.error) {
			toast.error(actionData.error);
		}
	}, [actionData]);

	const isLoading = navigation.state === 'submitting';

	return (
		<div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
			<div className="sm:mx-auto sm:w-full sm:max-w-md">
				<h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Join Interview</h2>
				<p className="mt-2 text-center text-sm text-gray-600">
					You've been invited to join {interview.name} interview
				</p>
			</div>

			<div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
				<div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
					{isAuthenticated ? (
						<>
							{userEmail === invitation.email ? (
								<Form method="post" className="space-y-6">
									<input type="hidden" name="action" value="accept" />
									<div>
										<button
											type="submit"
											disabled={isLoading}
											className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
										>
											{isLoading ? 'Accepting...' : 'Accept Invitation'}
										</button>
									</div>
								</Form>
							) : (
								<div className="text-center text-red-600">
									You're logged in as {userEmail}, but this invitation is for {invitation.email}
								</div>
							)}
						</>
					) : (
						<div className="space-y-6">
							<div className="flex items-center justify-center">
								<a
									href="/login"
									className="text-sm font-medium text-blue-600 hover:text-blue-500"
								>
									Sign In with Google
								</a>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
} 