import { UserRole } from './role';

export type Profile = {
	id: string;
	email: string;
	role: UserRole;
	created_at?: string;
	updated_at?: string;
};
