import { createBrowserClient } from '@supabase/ssr';
import { useEffect, useState } from 'react';
import { useLoaderData, useNavigate, useParams } from 'react-router';
import { useOrganization } from '~/contexts/OrganizationContext';
import type { Organization } from '~/types/organization';
import { getSupabaseEnv } from '~/utils/env.server';

export const loader = async () => {
	return {
		env: getSupabaseEnv(),
	};
};

export default function OrganizationSettings() {
	const { slug } = useParams();
	const navigate = useNavigate();
	const { env } = useLoaderData<typeof loader>();
	const supabase = createBrowserClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
	const { userRole } = useOrganization();
	const [organization, setOrganization] = useState<Organization | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!slug) return;

		async function loadOrganization() {
			const { data, error } = await supabase
				.from('organizations')
				.select('*')
				.eq('slug', slug as string)
				.single();

			if (error) {
				console.error('Error loading organization:', error);
				setError('Failed to load organization');
				return;
			}

			setOrganization(data as Organization);
			setIsLoading(false);
		}

		loadOrganization();
	}, [slug, supabase]);

	if (isLoading) {
		return <div>Loading...</div>;
	}

	if (error || !organization) {
		return <div className="text-red-600">{error || 'Organization not found'}</div>;
	}

	if (!userRole || !['owner', 'admin'].includes(userRole)) {
		return <div>You don't have permission to access this page</div>;
	}

	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const formData = new FormData(event.currentTarget);
		const name = formData.get('name') as string;

		if (!name?.trim()) {
			setError('Organization name is required');
			return;
		}

		// Generate a URL-friendly slug from the name
		const newSlug = name
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-|-$/g, '');

		const { error: updateError } = await supabase
			.from('organizations')
			.update({
				name,
				slug: newSlug,
			})
			.eq('id', organization.id);

		if (updateError) {
			console.error('Error updating organization:', updateError);
			setError('Failed to update organization');
			return;
		}

		navigate(`/dashboard/orgs/${newSlug}/settings`);
	}

	return (
		<div className="mx-auto max-w-md">
			<div className="rounded-xl bg-white p-6 shadow">
				<h2 className="text-base font-semibold leading-7 text-gray-900">Organization Settings</h2>
				<p className="mt-1 text-sm leading-6 text-gray-600">Manage your organization settings.</p>

				<form onSubmit={handleSubmit} className="mt-6">
					<div>
						<label htmlFor="name" className="block text-sm font-medium leading-6 text-gray-900">
							Organization Name
						</label>
						<div className="mt-2">
							<input
								type="text"
								name="name"
								id="name"
								required
								defaultValue={organization?.name}
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
							Save Changes
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
