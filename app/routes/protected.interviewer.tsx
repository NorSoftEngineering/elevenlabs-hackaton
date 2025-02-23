import { Outlet, redirect } from 'react-router';
import { isInterviewerRole } from '~/types/role';
import { getSupabaseEnv } from '~/utils/env.server';
import { createSupabaseServer } from '~/utils/supabase.server';

export const loader = async ({ request }: { request: Request }) => {
	const headers = new Headers();
	const supabase = createSupabaseServer(request, headers);
	const {
		data: { session },
	} = await supabase.auth.getSession();

	if (!session) {
		return redirect('/login');
	}

	// Check if user has a role
	const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();

	if (!profile?.role) {
		return redirect('/role-selection');
	}

	// Check if user is an interviewer
	if (!isInterviewerRole(profile.role)) {
		return redirect('/candidate/dashboard');
	}

	return { env: getSupabaseEnv() };
};

export default function ProtectedInterviewerLayout() {
	return <Outlet />;
}
