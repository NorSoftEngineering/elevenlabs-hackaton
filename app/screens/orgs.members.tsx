import { createBrowserClient } from '@supabase/ssr';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { useLoaderData } from 'react-router';
import { useOrganization } from '~/contexts/OrganizationContext';
import type { Organization, OrganizationMember } from '~/types/organization';
import { getSupabaseEnv } from '~/utils/env.server';

type MemberData = {
	id: string;
	organization_id: string;
	user_id: string;
	role: OrganizationMember['role'];
	user_email: string;
};

export const loader = async () => {
	return {
		env: getSupabaseEnv(),
	};
};

export default function OrganizationMembers() {
	const { slug } = useParams();
	const { env } = useLoaderData<typeof loader>();
	const supabase = createBrowserClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
	const { userRole } = useOrganization();
	const [organization, setOrganization] = useState<Organization | null>(null);
	const [members, setMembers] = useState<MemberData[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [inviteEmail, setInviteEmail] = useState('');

	useEffect(() => {
		if (!slug) return;

		async function loadOrganizationAndMembers() {
			// Load organization
			const { data: org, error: orgError } = await supabase
				.from('organizations')
				.select('*')
				.eq('slug', slug as string)
				.single();

			if (orgError) {
				console.error('Error loading organization:', orgError);
				setError('Failed to load organization');
				return;
			}

			const typedOrg = org as Organization;
			setOrganization(typedOrg);

			// Load members with their emails
			const { data: membersData, error: membersError } = await supabase
				.from('member_profiles')
				.select('*')
				.eq('organization_id', typedOrg.id);

			if (membersError) {
				console.error('Error loading members:', membersError);
				setError('Failed to load members');
				return;
			}

			setMembers(
				(membersData || []).map((member: MemberData) => ({
					...member,
					user_email: member.user_email || 'Unknown',
				})),
			);
			setIsLoading(false);
		}

		loadOrganizationAndMembers();
	}, [slug, supabase]);

	if (isLoading) {
		return <div>Loading...</div>;
	}

	if (error || !organization) {
		return <div className="text-brand-accent">{error || 'Organization not found'}</div>;
	}

	if (!userRole || !['owner', 'admin'].includes(userRole)) {
		return <div>You don't have permission to access this page</div>;
	}

	async function handleInvite(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (!inviteEmail.trim() || !organization) return;

		// First, check if the user exists
		const { data: userData, error: userError } = await supabase
			.from('auth.users')
			.select('id, email')
			.eq('email', inviteEmail)
			.single();

		if (userError || !userData) {
			setError('User not found');
			return;
		}

		// Then add them to the organization
		const { error: inviteError } = await supabase.from('organization_members').insert([
			{
				organization_id: organization.id,
				user_id: userData.id,
				role: 'member',
			},
		]);

		if (inviteError) {
			console.error('Error inviting member:', inviteError);
			setError('Failed to invite member');
			return;
		}

		// Refresh members list
		const { data: newMembersData } = await supabase
			.from('member_profiles')
			.select('*')
			.eq('organization_id', organization.id);

		setMembers(
			(newMembersData || []).map((member: MemberData) => ({
				...member,
				user_email: member.user_email || 'Unknown',
			})),
		);

		setInviteEmail('');
	}

	async function handleRoleChange(memberId: string, newRole: OrganizationMember['role']) {
		const { error: updateError } = await supabase
			.from('organization_members')
			.update({ role: newRole })
			.eq('id', memberId);

		if (updateError) {
			console.error('Error updating role:', updateError);
			setError('Failed to update role');
			return;
		}

		setMembers(members.map(member => (member.id === memberId ? { ...member, role: newRole } : member)));
	}

	async function handleRemoveMember(memberId: string) {
		const { error: removeError } = await supabase.from('organization_members').delete().eq('id', memberId);

		if (removeError) {
			console.error('Error removing member:', removeError);
			setError('Failed to remove member');
			return;
		}

		setMembers(members.filter(member => member.id !== memberId));
	}

	return (
		<div className="mx-auto max-w-3xl">
			<div className="rounded-xl bg-white p-6 shadow">
				<h2 className="text-base font-semibold leading-7 text-gray-900">Organization Members</h2>
				<p className="mt-1 text-sm leading-6 text-gray-600">Manage members of your organization.</p>

				<form onSubmit={handleInvite} className="mt-6">
					<div>
						<label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
							Add Member by Email
						</label>
						<div className="mt-2">
							<input
								type="email"
								name="email"
								id="email"
								value={inviteEmail}
								onChange={e => setInviteEmail(e.target.value)}
								required
								className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-brand-secondary placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-brand-primary sm:text-sm sm:leading-6"
							/>
						</div>
						{error && <p className="mt-2 text-sm text-brand-accent">{error}</p>}
					</div>

					<div className="mt-6 flex items-center justify-end gap-x-6">
						<button
							type="submit"
							className="rounded-md bg-brand-primary px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
						>
							Add Member
						</button>
					</div>
				</form>

				<div className="mt-8">
					<table className="min-w-full divide-y divide-brand-neutral/20">
						<thead>
							<tr>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Email
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
								<th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
									Actions
								</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-brand-neutral/20">
							{members.map(member => (
								<tr key={member.id}>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{member.user_email}</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
										<select
											value={member.role}
											onChange={e => handleRoleChange(member.id, e.target.value as OrganizationMember['role'])}
											className="rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-brand-secondary focus:ring-2 focus:ring-inset focus:ring-brand-primary sm:text-sm sm:leading-6"
										>
											<option value="member">Member</option>
											<option value="admin">Admin</option>
											{userRole === 'owner' && <option value="owner">Owner</option>}
										</select>
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
										<button
											onClick={() => handleRemoveMember(member.id)}
											className="text-brand-accent hover:text-brand-accent/80"
										>
											Remove
										</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
}
