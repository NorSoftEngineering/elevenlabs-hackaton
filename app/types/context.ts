import type { SupabaseClient } from '@supabase/supabase-js';
import type { Session } from '@supabase/supabase-js';

export type OutletContext = {
	supabase: SupabaseClient;
	session: Session | null;
};
