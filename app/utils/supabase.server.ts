import { createServerClient, parseCookieHeader, serializeCookieHeader } from '@supabase/ssr';
import { getSupabaseEnv } from './env.server';

export const createSupabaseServer = (request: Request, headers: Headers) => {
	const { SUPABASE_URL, SUPABASE_ANON_KEY } = getSupabaseEnv();
	return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
		cookies: {
			getAll() {
				return parseCookieHeader(request.headers.get('Cookie') ?? '');
			},
			setAll(cookiesToSet) {
				cookiesToSet.forEach(({ name, value, options }) =>
					headers.append('Set-Cookie', serializeCookieHeader(name, value, options)),
				);
			},
		},
	});
};
