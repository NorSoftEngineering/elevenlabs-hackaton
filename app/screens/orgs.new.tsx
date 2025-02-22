import { useNavigate, useLoaderData } from 'react-router';
import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { getSupabaseEnv } from '~/utils/env.server';

export const loader = async ({ request }: { request: Request }) => {
  return {
    env: getSupabaseEnv(),
  };
};

export default function NewOrganization() {
  const navigate = useNavigate();
  const { env } = useLoaderData<typeof loader>();
  const supabase = createBrowserClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = formData.get('name') as string;

    if (!name?.trim()) {
      setError('Organization name is required');
      return;
    }

    // Check session first
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      console.error('Session error:', sessionError);
      setError('Authentication error - please try logging in again');
      return;
    }

    if (!session.user.id) {
      setError('You must be logged in to create an organization');
      return;
    }

    // Generate a URL-friendly slug from the name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    // Try inserting with explicit owner_id
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .insert([
        {
          name,
          slug,
          owner_id: session.user.id
        },
      ])
      .select()
      .single();

    if (orgError) {
      console.error('Error creating organization:', orgError);
      setError('Failed to create organization: ' + orgError.message);
      return;
    }

    // If we get here, org creation worked
    const { error: memberError } = await supabase
      .from('organization_members')
      .insert([
        {
          organization_id: org.id,
          user_id: session.user.id,
          role: 'owner',
        },
      ]);

    if (memberError) {
      console.error('Error adding member:', memberError);
      setError('Failed to add you as organization owner: ' + memberError.message);
      return;
    }

    // Navigate to the organization settings page
    navigate(`/dashboard/orgs/${slug}/settings`);
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="rounded-xl bg-white p-6 shadow">
        <h2 className="text-base font-semibold leading-7 text-gray-900">
          Create New Organization
        </h2>
        <p className="mt-1 text-sm leading-6 text-gray-600">
          Create a new organization to collaborate with your team.
        </p>

        <form onSubmit={handleSubmit} className="mt-6">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              Organization Name
            </label>
            <div className="mt-2">
              <input
                type="text"
                name="name"
                id="name"
                required
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-brand-secondary placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-brand-primary sm:text-sm sm:leading-6"
              />
            </div>
            {error && (
              <p className="mt-2 text-sm text-brand-accent">{error}</p>
            )}
          </div>

          <div className="mt-6 flex items-center justify-end gap-x-6">
            <button
              type="submit"
              className="rounded-md bg-brand-primary px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
            >
              Create Organization
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 