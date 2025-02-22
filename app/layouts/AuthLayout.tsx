import { Outlet } from 'react-router';

type AuthLayoutProps = {
	children: React.ReactNode;
};

export function AuthLayout({ children }: AuthLayoutProps) {
	return (
		<div className="min-h-screen flex items-center justify-center bg-brand-neutral/10 py-12 px-4 sm:px-6 lg:px-8">
			<div className="max-w-md w-full space-y-8">{children}</div>
		</div>
	);
}
