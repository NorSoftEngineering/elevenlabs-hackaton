import type { Session } from '@supabase/supabase-js';
import type { TypedSupabaseClient } from '~/utils/supabase.client';

export type OutletContext = {
  supabase: TypedSupabaseClient;
  session: Session | null;
}; 