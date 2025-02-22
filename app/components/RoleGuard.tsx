import { ReactNode } from 'react';
import { Navigate } from 'react-router';
import { useRole } from '~/contexts/RoleContext';
import { UserRole, isInterviewerRole } from '~/types/role';

type RoleGuardProps = {
	children: ReactNode;
	allowedRoles: UserRole[];
	redirectTo?: string;
};

export default function RoleGuard({ children, allowedRoles, redirectTo = '/' }: RoleGuardProps) {
	const { userRole, isLoading } = useRole();

	if (isLoading) {
		return <div>Loading...</div>;
	}

	if (!userRole || !allowedRoles.includes(userRole)) {
		// Special case: if user has no role, redirect to role selection
		if (!userRole) {
			return <Navigate to="/role-selection" replace />;
		}

		// For candidates trying to access interviewer pages
		if (!isInterviewerRole(userRole)) {
			return <Navigate to="/candidate/dashboard" replace />;
		}

		return <Navigate to={redirectTo} replace />;
	}

	return <>{children}</>;
}
