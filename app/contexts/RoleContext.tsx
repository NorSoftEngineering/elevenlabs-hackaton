import { createBrowserClient } from '@supabase/ssr';
import { User } from '@supabase/supabase-js';
import { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { Profile } from '~/types/profile';
import { UserRole } from '~/types/role';

type RoleContextType = {
	userRole: UserRole | null;
	isLoading: boolean;
	updateRole: (role: UserRole) => Promise<void>;
};

const RoleContext = createContext<RoleContextType | null>(null);

type RoleProviderProps = {
	children: ReactNode;
	env: {
		SUPABASE_URL: string;
		SUPABASE_ANON_KEY: string;
	};
};

export function RoleProvider({ children, env }: RoleProviderProps) {
	const supabase = createBrowserClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
	const [userRole, setUserRole] = useState<UserRole | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [user, setUser] = useState<User | null>(null);

	useEffect(() => {
		supabase.auth.getSession().then(({ data: { session } }) => {
			setUser(session?.user ?? null);
		});

		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, session) => {
			setUser(session?.user ?? null);
		});

		return () => {
			subscription.unsubscribe();
		};
	}, [supabase]);

	useEffect(() => {
		if (!user?.id) {
			setUserRole(null);
			setIsLoading(false);
			return;
		}

		async function loadUserRole() {
			try {
				const { data, error } = await supabase.from('profiles').select('role').eq('id', user?.id).single();

				if (error) throw error;

				const profile = data as Profile;
				setUserRole(profile.role);
			} catch (error) {
				console.error('Error loading user role:', error);
			} finally {
				setIsLoading(false);
			}
		}

		loadUserRole();
	}, [user?.id, supabase]);

	const updateRole = async (role: UserRole) => {
		if (!user?.id) return;

		try {
			const { error } = await supabase.from('profiles').update({ role }).eq('id', user.id);

			if (error) throw error;
			setUserRole(role);
		} catch (error) {
			console.error('Error updating user role:', error);
			throw error;
		}
	};

	return (
		<RoleContext.Provider
			value={{
				userRole,
				isLoading,
				updateRole,
			}}
		>
			{children}
		</RoleContext.Provider>
	);
}

export function useRole() {
	const context = useContext(RoleContext);
	if (!context) {
		throw new Error('useRole must be used within a RoleProvider');
	}
	return context;
}
