import { createClient } from '@supabase/supabase-js';
import { useMemo } from 'react';
import type { Database } from '~/database.types';

// These should be available in your environment
declare global {
	interface Window {
		env: {
			SUPABASE_URL: string;
			SUPABASE_ANON_KEY: string;
		};
	}
}

export function useSupabase() {
	const supabase = useMemo(() => {
		return createClient<Database>(window.env.SUPABASE_URL, window.env.SUPABASE_ANON_KEY);
	}, []);

	return { supabase };
}
