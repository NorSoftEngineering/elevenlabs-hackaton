import { Link } from 'react-router';
import {
	type ActionFunctionArgs,
	Form,
	type LoaderFunctionArgs,
	redirect,
	useActionData,
	useLoaderData,
	useNavigation,
} from 'react-router';
import { ErrorBoundary } from '~/components/ErrorBoundary';
import { type Interview } from '~/types';
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

	if (!['owner', 'admin'].includes(orgMember.role)) {
		throw new Error('Not authorized');
	}

	return { organizationId: orgMember.organization_id };
}

export async function action({ request }: ActionFunctionArgs) {
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

	const name = formData.get('name')?.toString();
	const description = formData.get('description')?.toString();
	const duration = formData.get('duration')?.toString();

	if (!name) {
		return { error: 'Name is required' } as const;
	}

	if (!duration) {
		return { error: 'Duration is required' } as const;
	}

	const interview: Omit<Interview, 'id' | 'created_at' | 'updated_at'> = {
		organization_id: orgMember.organization_id,
		name,
		description,
		duration,
		status: 'ready',
	};

	const { error } = await supabase.from('interviews').insert(interview).select().single();

	if (error) {
		return { error: 'Failed to create interview' } as const;
	}

	return redirect('/dashboard/interviews');
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
						{[1, 2, 3].map(i => (
							<div key={i}>
								<div className="h-4 w-24 bg-gray-200 rounded mb-2"></div>
								<div className="h-10 bg-gray-200 rounded"></div>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}

export default function InterviewNewScreen() {
	const { organizationId } = useLoaderData<typeof loader>();
	const actionData = useActionData<typeof action>();
	const navigation = useNavigation();

	if (navigation.state === 'loading') {
		return <LoadingState />;
	}

	return (
		<div className="p-6 max-w-4xl mx-auto">
			<div className="flex justify-between items-center mb-6">
				<div>
					<Link to="/interviewer/interviews" className="text-gray-600 hover:text-gray-800 mb-2 inline-block">
						← Back to Interviews
					</Link>
					<h1 className="text-2xl font-bold text-gray-700">Create Interview</h1>
				</div>
			</div>

			<div className="bg-white rounded-lg shadow overflow-hidden">
				<Form method="post" className="p-6">
					<input type="hidden" name="organization_id" value={organizationId} />

					{actionData?.error && (
						<div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
							<p className="text-sm text-red-600">{actionData.error}</p>
						</div>
					)}

					<div className="space-y-4">
						<div>
							<label htmlFor="name" className="block text-sm font-medium text-gray-700">
								Name
							</label>
							<input
								type="text"
								name="name"
								id="name"
								required
								className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-gray-700"
							/>
						</div>

						<div>
							<label htmlFor="description" className="block text-sm font-medium text-gray-700">
								Description
							</label>
							<textarea
								name="description"
								id="description"
								rows={3}
								className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-gray-700"
							/>
						</div>

						<div>
							<label htmlFor="duration" className="block text-sm font-medium text-gray-700">
								Duration
							</label>
							<select
								name="duration"
								id="duration"
								required
								className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-gray-700"
							>
								<option value="30 minutes">30 minutes</option>
								<option value="1 hour">1 hour</option>
								<option value="1 hour 30 minutes">1 hour 30 minutes</option>
								<option value="2 hours">2 hours</option>
								<option value="2 hours 30 minutes">2 hours 30 minutes</option>
								<option value="3 hours">3 hours</option>
							</select>
						</div>

						<div className="pt-4">
							<button
								type="submit"
								className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
							>
								Create Interview
							</button>
						</div>
					</div>
				</Form>
			</div>
		</div>
	);
}
