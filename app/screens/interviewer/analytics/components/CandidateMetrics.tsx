import { UserGroupIcon, UserIcon, BriefcaseIcon } from '@heroicons/react/24/outline';
import { StatsCard } from './StatsCard';
import { BarChart } from './BarChart';
import { cn } from '~/utils/cn';

type CandidateMetricsProps = {
  stats: {
    totalCandidates: number;
    acceptedInvitations: number;
    totalInvitations: number;
    avgExperienceYears: number;
    allSkills: string[];
  };
  previousStats?: {
    totalCandidates: number;
    acceptedInvitations: number;
    totalInvitations: number;
    avgExperienceYears: number;
  };
};

export function CandidateMetrics({ stats, previousStats }: CandidateMetricsProps) {
  const responseRate = stats.totalInvitations === 0 ? 0 : (stats.acceptedInvitations / stats.totalInvitations) * 100;
  const previousResponseRate = previousStats?.totalInvitations === 0 ? 0 :
    previousStats ? (previousStats.acceptedInvitations / previousStats.totalInvitations) * 100 : undefined;

  const getTrend = (current: number, previous: number | undefined) => {
    if (!previous) return undefined;
    const change = ((current - previous) / previous) * 100;
    return {
      value: Math.abs(Math.round(change)),
      isPositive: change > 0,
    };
  };

  // Group skills by frequency
  const skillFrequency = stats.allSkills.reduce((acc, skill) => {
    acc[skill] = (acc[skill] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Sort skills by frequency and take top 10
  const topSkills = Object.entries(skillFrequency)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([name, value]) => ({ name, value }));

  const invitationData = [
    { name: 'Accepted', value: stats.acceptedInvitations },
    { name: 'Pending/Declined', value: stats.totalInvitations - stats.acceptedInvitations },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Candidate Metrics</h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <StatsCard
          title="Total Candidates"
          value={stats.totalCandidates}
          trend={getTrend(stats.totalCandidates, previousStats?.totalCandidates)}
          icon={<UserGroupIcon className="h-6 w-6" />}
        />
        <StatsCard
          title="Response Rate"
          value={`${Math.round(responseRate)}%`}
          trend={getTrend(responseRate, previousResponseRate)}
          icon={<UserIcon className="h-6 w-6" />}
        />
        <StatsCard
          title="Avg. Experience"
          value={`${Math.round(stats.avgExperienceYears)} years`}
          trend={getTrend(stats.avgExperienceYears, previousStats?.avgExperienceYears)}
          icon={<BriefcaseIcon className="h-6 w-6" />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <BarChart
          title="Invitation Response Distribution"
          data={invitationData}
          xAxisKey="name"
          bars={[
            {
              key: 'value',
              name: 'Candidates',
              color: '#4F46E5',
            },
          ]}
        />
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Top Skills</h3>
          <div className="mt-6 space-y-4">
            {topSkills.map(skill => (
              <div key={skill.name} className="flex items-center">
                <div className="w-32 text-sm text-gray-500">{skill.name}</div>
                <div className="flex-1">
                  <div className="relative h-4 overflow-hidden rounded bg-gray-100">
                    <div
                      className="absolute inset-y-0 left-0 bg-indigo-600"
                      style={{
                        width: `${(skill.value / Math.max(...topSkills.map(s => s.value))) * 100}%`,
                      }}
                    />
                  </div>
                </div>
                <div className="ml-4 w-12 text-right text-sm text-gray-500">{skill.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 