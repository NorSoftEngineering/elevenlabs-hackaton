import { Link } from 'react-router';
import { type LoaderFunctionArgs, useLoaderData, useNavigation } from 'react-router';
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
    console.error('Failed to load profile', error);
    throw new Error('Failed to load profile');
  }

  return { profile };
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
            <div>
              <div className="h-6 w-48 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 w-32 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 w-40 bg-gray-200 rounded mb-4"></div>
              
              <div className="mb-6">
                <div className="h-4 w-36 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 w-48 bg-gray-200 rounded mb-1"></div>
                <div className="h-4 w-32 bg-gray-200 rounded"></div>
              </div>
            </div>

            <div>
              <div className="mb-6">
                <div className="h-4 w-24 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 w-16 bg-gray-200 rounded"></div>
              </div>

              <div className="mb-6">
                <div className="h-4 w-16 bg-gray-200 rounded mb-2"></div>
                <div className="flex flex-wrap gap-2">
                  <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
                  <div className="h-6 w-24 bg-gray-200 rounded-full"></div>
                  <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <div className="h-4 w-16 bg-gray-200 rounded mb-2"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyProfile() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-blue-400">My Profile</h1>
        <Link
          to="/candidate/profile/edit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Complete Profile
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6">
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Complete Your Profile</h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Tell us about yourself! Complete your profile to help companies learn more about your skills and experience.
            </p>
            <Link
              to="/candidate/profile/edit"
              className="inline-flex items-center text-blue-600 hover:text-blue-800"
            >
              Get Started →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProfileScreen() {
  const { profile } = useLoaderData<typeof loader>();
  const navigation = useNavigation();

  if (navigation.state === 'loading') {
    return <LoadingProfile />;
  }

  // Check if profile is empty
  const isProfileEmpty = !profile.name && !profile.title && !profile.bio && (!profile.skills || profile.skills.length === 0);

  if (isProfileEmpty) {
    return <EmptyProfile />;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-brand-primary">My Profile</h1>
        <Link
          to="/candidate/profile/edit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Edit Profile
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-semibold mb-4 text-brand-primary/80">{profile.name}</h2>
              {profile.title && <p className="text-gray-600 mb-2">{profile.title}</p>}
              {profile.location && <p className="text-gray-600 mb-4">{profile.location}</p>}
              
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Contact Information</h3>
                {profile.email && <p className="text-gray-900 mb-1">{profile.email}</p>}
                {profile.phone && <p className="text-gray-900">{profile.phone}</p>}
              </div>
            </div>

            <div>
              {profile.experience_years !== null && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Experience</h3>
                  <p className="text-gray-900">{profile.experience_years} years</p>
                </div>
              )}

              {profile.skills && profile.skills.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill: string) => (
                      <span
                        key={skill}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {profile.bio && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">About</h3>
              <p className="text-gray-900">{profile.bio}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 