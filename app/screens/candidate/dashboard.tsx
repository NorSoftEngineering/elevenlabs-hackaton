import { createBrowserClient } from '@supabase/ssr';
import { useEffect, useState } from 'react';
import { useLoaderData } from 'react-router';
import { Link } from 'react-router';
import RoleGuard from '~/components/RoleGuard';
import { getSupabaseEnv } from '~/utils/env.server';
import type { Interview, CandidateProfile } from '~/types/candidate';

export const loader = async () => {
    return {
        env: getSupabaseEnv(),
    };
};

export default function CandidateDashboard() {
    const { env } = useLoaderData<typeof loader>();
    const supabase = createBrowserClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
    const [upcomingInterviews, setUpcomingInterviews] = useState<Interview[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [profileCompletion, setProfileCompletion] = useState(0);

    useEffect(() => {
        async function loadDashboardData() {
            try {
                const { data: session } = await supabase.auth.getSession();
                if (!session.session?.user.id) return;

                // Load upcoming interviews
                const { data: interviews, error: interviewError } = await supabase
                    .from('interviews')
                    .select('*, organizations(name)')
                    .eq('candidate_id', session.session.user.id)
                    .gt('start_datetime', new Date().toISOString())
                    .order('start_datetime', { ascending: true })
                    .limit(5);

                if (interviewError) throw interviewError;

                setUpcomingInterviews(interviews || []);

                // Calculate profile completion
                const { data: profile, error: profileError } = await supabase
                    .from('candidate_profiles')
                    .select('*')
                    .eq('user_id', session.session.user.id)
                    .single();

                if (profileError) throw profileError;

                const fields = ['bio', 'skills', 'experience', 'education', 'location'];
                const completedFields = fields.filter(field => profile && profile[field]);
                setProfileCompletion((completedFields.length / fields.length) * 100);
            } catch (err) {
                console.error('Error loading dashboard data:', err);
                setError('Failed to load dashboard data');
            } finally {
                setIsLoading(false);
            }
        }

        loadDashboardData();
    }, [supabase]);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <RoleGuard allowedRoles={['candidate']} redirectTo="/organizations">
            <div className="space-y-6">
                {/* Profile Completion Card */}
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-gray-900">Profile Completion</h2>
                            <span className="text-sm text-gray-500">{Math.round(profileCompletion)}%</span>
                        </div>
                        <div className="mt-4 w-full bg-gray-200 rounded-full h-2.5">
                            <div
                                className="bg-brand-primary h-2.5 rounded-full"
                                style={{ width: `${profileCompletion}%` }}
                            ></div>
                        </div>
                        <div className="mt-4">
                            <Link
                                to="/candidate/profile"
                                className="text-sm font-medium text-brand-primary hover:text-brand-primary/80"
                            >
                                Complete your profile →
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Upcoming Interviews */}
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Upcoming Interviews</h2>
                        {error && <p className="text-brand-accent mb-4">{error}</p>}
                        {upcomingInterviews.length === 0 ? (
                            <p className="text-gray-500">No upcoming interviews scheduled.</p>
                        ) : (
                            <div className="space-y-4">
                                {upcomingInterviews.map((interview) => (
                                    <div
                                        key={interview.id}
                                        className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="text-lg font-medium text-gray-900">
                                                    {interview.position}
                                                </h3>
                                                <p className="text-sm text-gray-500">{interview.organization_name}</p>
                                            </div>
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                {interview.status}
                                            </span>
                                        </div>
                                        <div className="mt-2 text-sm text-gray-500">
                                            {new Date(interview.start_datetime).toLocaleString()} ({interview.duration} min)
                                        </div>
                                        <div className="mt-2">
                                            <Link
                                                to={`/candidate/interviews/${interview.id}`}
                                                className="text-sm font-medium text-brand-primary hover:text-brand-primary/80"
                                            >
                                                View details →
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <Link
                                to="/candidate/interviews"
                                className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400"
                            >
                                <div className="flex-shrink-0">
                                    <svg
                                        className="h-6 w-6 text-gray-400"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                        />
                                    </svg>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <span className="absolute inset-0" aria-hidden="true" />
                                    <p className="text-sm font-medium text-gray-900">View All Interviews</p>
                                    <p className="text-sm text-gray-500">See your interview history and schedule</p>
                                </div>
                            </Link>

                            <Link
                                to="/candidate/profile/edit"
                                className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400"
                            >
                                <div className="flex-shrink-0">
                                    <svg
                                        className="h-6 w-6 text-gray-400"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                        />
                                    </svg>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <span className="absolute inset-0" aria-hidden="true" />
                                    <p className="text-sm font-medium text-gray-900">Edit Profile</p>
                                    <p className="text-sm text-gray-500">Update your information and preferences</p>
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </RoleGuard>
    );
} 