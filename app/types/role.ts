export type UserRole = 'admin' | 'interviewer' | 'candidate';

export const USER_ROLES: UserRole[] = ['admin', 'interviewer', 'candidate'];

export const isInterviewerRole = (role: UserRole | null): boolean => {
	return role === 'interviewer' || role === 'admin';
};

export const isAdminRole = (role: UserRole | null): boolean => {
	return role === 'admin';
};

export const isCandidateRole = (role: UserRole | null): boolean => {
	return role === 'candidate';
};
