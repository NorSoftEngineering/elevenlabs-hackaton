import { createBrowserClient } from '@supabase/ssr';
import { redirect, useLoaderData } from 'react-router';
import RoleSelectionForm from '~/components/RoleSelectionForm';
import { getSupabaseEnv } from '~/utils/env.server';
import { createSupabaseServer } from '~/utils/supabase.server';

export const headers = () => ({
	'Cache-Control': 'no-store',
});

export const loader = async ({ request }: { request: Request }) => {
	const headers = new Headers();
	const env = getSupabaseEnv();
	const supabase = createSupabaseServer(request, headers);

	const {
		data: { session },
	} = await supabase.auth.getSession();

	if (!session) {
		return redirect('/login', {
			headers,
		});
	}

	const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();

	if (profile?.role) {
		return redirect(profile.role === 'interviewer' ? '/dashboard' : '/candidate/dashboard', {
			headers,
		});
	}

	return { env };
};

export default function RoleSelectionScreen() {
	useLoaderData<typeof loader>();
	return <RoleSelectionForm />;
}
