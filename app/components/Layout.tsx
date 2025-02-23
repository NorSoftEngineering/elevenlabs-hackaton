import { SupabaseClient } from '@supabase/supabase-js';
import { Session } from '@supabase/supabase-js';
import { ReactNode } from 'react';
import { useLocation } from 'react-router';
import Navigation from './Navigation';

type LayoutProps = {
	children: ReactNode;
	context: {
		supabase: SupabaseClient;
		session: Session;
	};
};

export default function Layout({ children, context }: LayoutProps) {
	const location = useLocation();
	return (
		<div className="min-h-screen bg-gray-50">
			{location.pathname === '/' ? (
				<div className="px-5 pt-16 flex justify-center items-center">{children}</div>
			) : (
				<>
					<Navigation context={context} />
					<main className="mx-auto py-6 sm:px-6 lg:px-8 pt-20">{children}</main>
				</>
			)}
		</div>
	);
}
