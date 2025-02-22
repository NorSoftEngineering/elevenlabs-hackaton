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

  await supabase.auth.exchangeCodeForSession(code);

  return redirect('/', {
    headers,
  });
}; 