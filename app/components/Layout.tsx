import { ReactNode } from 'react';
import Navigation from './Navigation';
import { SupabaseClient } from '@supabase/supabase-js';
import { Session } from '@supabase/supabase-js';

type LayoutProps = {
	children: ReactNode;
	context: {
		supabase: SupabaseClient;
		session: Session;
	};
};

export default function Layout({ children, context }: LayoutProps) {
	return (
		<div className="min-h-screen bg-gray-50">
			<Navigation context={context} />
			<main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">{children}</main>
		</div>
	);
}
