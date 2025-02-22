import { ReactNode } from 'react';
import Navigation from './Navigation';

type LayoutProps = {
	children: ReactNode;
};

export default function Layout({ children }: LayoutProps) {
	return (
		<div className="min-h-screen bg-gray-50">
			<Navigation />
			<main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">{children}</main>
		</div>
	);
}
