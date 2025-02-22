import { redirect } from 'react-router';
import { createSupabaseServer } from '~/utils/supabase.server';

export const headers = () => ({
	'Cache-Control': 'no-store',
});

export const loader = async ({ request }: { request: Request }) => {
	const headers = new Headers();
	const supabase = createSupabaseServer(request, headers);
	const url = new URL(request.url);
	const code = url.searchParams.get('code');

	if (!code) {
		return redirect('/login');
	}

	const { data: authData, error: authError } = await supabase.auth.exchangeCodeForSession(code);

	if (authError || !authData.session) {
		console.error('Auth error:', authError);
		return redirect('/login');
	}

	// Check profile role and redirect accordingly
	const { data: profile } = await supabase
		.from('profiles')
		.select('role')
		.eq('id', authData.session.user.id)
		.single();

	// Profile will exist (created by trigger) but role will be null for new users
	if (!profile?.role) {
		return redirect('/role-selection', {
			headers,
		});
	}

	// Redirect to appropriate dashboard based on role
	return redirect(profile.role === 'interviewer' ? '/dashboard' : '/candidate/dashboard', {
		headers,
	});
};
