import { createBrowserClient } from '@supabase/ssr';
import { User } from '@supabase/supabase-js';
import { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import type { Organization, OrganizationMember } from '~/types/organization';
import { isInterviewerRole } from '~/types/role';
import { useRole } from './RoleContext';

type OrganizationContextType = {
	currentOrganization: Organization | null;
	userOrganizations: Organization[];
	userRole: OrganizationMember['role'] | null;
	setCurrentOrganization: (org: Organization | null) => void;
	isLoading: boolean;
};

const OrganizationContext = createContext<OrganizationContextType | null>(null);

type MembershipData = {
	organization_id: string;
	role: OrganizationMember['role'];
};

type OrganizationProviderProps = {
	children: ReactNode;
	env: {
		SUPABASE_URL: string;
		SUPABASE_ANON_KEY: string;
	};
};

export function OrganizationProvider({ children, env }: OrganizationProviderProps) {
	const supabase = createBrowserClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
	const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);
	const [userOrganizations, setUserOrganizations] = useState<Organization[]>([]);
	const [userRole, setUserRole] = useState<OrganizationMember['role'] | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [user, setUser] = useState<User | null>(null);
	const { userRole: globalUserRole } = useRole();

	useEffect(() => {
		// If user is not an interviewer, clear organization data
		if (!isInterviewerRole(globalUserRole)) {
			setCurrentOrganization(null);
			setUserOrganizations([]);
			setUserRole(null);
			return;
		}

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
	}, [supabase, globalUserRole]);

	useEffect(() => {
		if (!user?.id) {
			setCurrentOrganization(null);
			setUserOrganizations([]);
			setUserRole(null);
			return;
		}

		async function loadOrganizations() {
			try {
				if (!user) return;

				const { data: memberships, error: membershipError } = await supabase
					.from('organization_members')
					.select('organization_id, role')
					.eq('user_id', user.id);

				if (membershipError) throw membershipError;

				const typedMemberships = memberships as MembershipData[] | null;
				const orgIds = typedMemberships?.map(m => m.organization_id) || [];

				if (orgIds.length === 0) {
					// Batch state updates together
					Promise.resolve().then(() => {
						setUserOrganizations([]);
						setIsLoading(false);
					});
					return;
				}

				const { data: orgs, error: orgsError } = await supabase.from('organizations').select('*').in('id', orgIds);

				if (orgsError) throw orgsError;

				const typedOrgs = orgs as Organization[] | null;

				// Batch all state updates together
				Promise.resolve().then(() => {
					setUserOrganizations(typedOrgs || []);
					if (!currentOrganization && typedOrgs && typedOrgs.length > 0) {
						const firstOrg = typedOrgs[0];
						setCurrentOrganization(firstOrg);
						const userMembership = typedMemberships?.find(m => m.organization_id === firstOrg.id);
						setUserRole(userMembership?.role || null);
					}
					setIsLoading(false);
				});
			} catch (error) {
				console.error('Error loading organizations:', error);
				setIsLoading(false);
			}
		}

		loadOrganizations();
	}, [user?.id, supabase]);

	useEffect(() => {
		if (!user?.id || !currentOrganization?.id) {
			setUserRole(null);
			return;
		}

		async function loadUserRole() {
			try {
				if (!user || !currentOrganization?.id) return;

				const { data, error } = await supabase
					.from('organization_members')
					.select('role')
					.eq('organization_id', currentOrganization.id)
					.eq('user_id', user.id)
					.single();

				if (error) {
					console.error('Error loading user role:', error);
					return;
				}

				const typedData = data as { role: OrganizationMember['role'] };
				setUserRole(typedData.role);
			} catch (error) {
				console.error('Error loading user role:', error);
			}
		}

		loadUserRole();
	}, [currentOrganization?.id, user?.id, supabase]);

	return (
		<OrganizationContext.Provider
			value={{
				currentOrganization,
				userOrganizations,
				userRole,
				setCurrentOrganization,
				isLoading,
			}}
		>
			{children}
		</OrganizationContext.Provider>
	);
}

export function useOrganization() {
	const context = useContext(OrganizationContext);
	if (!context) {
		throw new Error('useOrganization must be used within an OrganizationProvider');
	}
	return context;
}
