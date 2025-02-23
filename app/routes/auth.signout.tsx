import { redirect, type ActionFunctionArgs } from 'react-router';
import { createSupabaseServer } from '~/utils/supabase.server';

export async function action({ request }: ActionFunctionArgs) {
	const response = new Response();
	const supabase = createSupabaseServer(request, response.headers);

	await supabase.auth.signOut();

	return redirect('/login', {
		headers: response.headers,
	});
}

export async function loader() {
	return redirect('/login');
}
