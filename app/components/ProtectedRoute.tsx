import { Navigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { LoadingSpinner } from './LoadingSpinner';

type ProtectedRouteProps = {
	children: React.ReactNode;
	requireAuth?: boolean;
};

export function ProtectedRoute({ children, requireAuth = true }: ProtectedRouteProps) {
	const { user, isLoading } = useAuth();

	// Only show loading state on initial load
	if (isLoading) {
		return <LoadingSpinner />;
	}

	// For auth required routes, redirect to login if no user
	if (requireAuth && !user) {
		return <Navigate to="/login" replace />;
	}

	// For non-auth routes (like login), redirect to dashboard if user exists
	if (!requireAuth && user) {
		return <Navigate to="/dashboard" replace />;
	}

	return <>{children}</>;
}
