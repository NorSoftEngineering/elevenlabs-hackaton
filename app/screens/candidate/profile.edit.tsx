import { redirect, type ActionFunctionArgs, type LoaderFunctionArgs } from 'react-router';
import { Form, useLoaderData, useNavigation, useActionData } from 'react-router';
import { createSupabaseServer } from '~/utils/supabase.server';
import { ErrorBoundary } from '~/components/ErrorBoundary';

export { ErrorBoundary };

export async function loader({ request }: LoaderFunctionArgs) {
  const headers = new Headers();
  const supabase = createSupabaseServer(request, headers);
  
  // Get the user's session first
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !session) {
    throw new Error('Not authenticated');
  }

  // Get the profile using the user's ID
  const { data: profile, error } = await supabase
    .from('candidate_profiles')
    .select('*')
    .eq('profile_id', session.user.id)
    .single();

  if (error) {
    throw new Error('Failed to load profile');
  }

  return { profile };
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const headers = new Headers();
  const supabase = createSupabaseServer(request, headers);

  // Get the user's session first
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !session) {
    throw new Error('Not authenticated');
  }

  const updates = {
    name: formData.get('name'),
    phone: formData.get('phone'),
    title: formData.get('title'),
    experience_years: parseInt(formData.get('experience_years') as string) || null,
    skills: formData.get('skills')?.toString().split(',').map(s => s.trim()).filter(Boolean) || [],
    bio: formData.get('bio'),
    location: formData.get('location'),
  };

  // Validate required fields
  if (!updates.name || !updates.title) {
    return { error: 'Name and title are required' };
  }

  const { error } = await supabase
    .from('candidate_profiles')
    .update(updates)
    .eq('profile_id', session.user.id)
    .single();

  if (error) {
    console.error('Failed to update profile', error);
    return { error: 'Failed to update profile' };
  }

  return redirect('/candidate/profile');
}

function LoadingProfile() {
  return (
    <div className="p-6 max-w-4xl mx-auto animate-pulse">
      <div className="flex justify-between items-center mb-6">
        <div className="h-8 w-32 bg-gray-200 rounded"></div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i}>
                  <div className="h-4 w-24 bg-gray-200 rounded mb-2"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i}>
                  <div className="h-4 w-24 bg-gray-200 rounded mb-2"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <div className="h-4 w-16 bg-gray-200 rounded mb-2"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProfileEditScreen() {
  const { profile } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const actionData = useActionData<typeof action>();
  const isSubmitting = navigation.state === 'submitting';

  if (navigation.state === 'loading') {
    return <LoadingProfile />;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Edit Profile</h1>
      </div>

      {actionData?.error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
          {actionData.error}
        </div>
      )}

      <Form method="post" className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  defaultValue={profile.name}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  defaultValue={profile.phone || ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  defaultValue={profile.title || ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700"
                  required
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  defaultValue={profile.location || ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Years of Experience
                </label>
                <input
                  type="number"
                  name="experience_years"
                  defaultValue={profile.experience_years || 0}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Skills (comma separated)
                </label>
                <input
                  type="text"
                  name="skills"
                  defaultValue={profile.skills?.join(', ')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2 text-gray-700"
                  placeholder="React, TypeScript, Node.js"
                />
              </div>
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bio
            </label>
            <textarea
              name="bio"
              defaultValue={profile.bio || ''}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700"
              rows={4}
            />
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </Form>
    </div>
  );
} 