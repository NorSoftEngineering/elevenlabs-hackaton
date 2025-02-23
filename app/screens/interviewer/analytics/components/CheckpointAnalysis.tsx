import { ClockIcon, CheckCircleIcon, ListBulletIcon } from '@heroicons/react/24/outline';
import { StatsCard } from './StatsCard';
import { BarChart } from './BarChart';
import { cn } from '~/utils/cn';

type CheckpointAnalysisProps = {
  stats: {
    totalCheckpoints: number;
    completedCheckpoints: number;
    avgCheckpointDurationMins: number;
    allTopics: string[];
  };
  previousStats?: {
    totalCheckpoints: number;
    completedCheckpoints: number;
    avgCheckpointDurationMins: number;
  };
};

export function CheckpointAnalysis({ stats, previousStats }: CheckpointAnalysisProps) {
  const completionRate = stats.totalCheckpoints === 0 ? 0 : (stats.completedCheckpoints / stats.totalCheckpoints) * 100;
  const previousCompletionRate = previousStats?.totalCheckpoints === 0 ? 0 :
    previousStats ? (previousStats.completedCheckpoints / previousStats.totalCheckpoints) * 100 : undefined;

  const getTrend = (current: number, previous: number | undefined) => {
    if (!previous) return undefined;
    const change = ((current - previous) / previous) * 100;
    return {
      value: Math.abs(Math.round(change)),
      isPositive: change > 0,
    };
  };

  // Group topics by frequency
  const topicFrequency = stats.allTopics.reduce((acc, topic) => {
    acc[topic] = (acc[topic] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Sort topics by frequency and take top 10
  const topTopics = Object.entries(topicFrequency)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([name, value]) => ({ name, value }));

  const checkpointData = [
    { name: 'Completed', value: stats.completedCheckpoints },
    { name: 'Pending', value: stats.totalCheckpoints - stats.completedCheckpoints },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Checkpoint Analysis</h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <StatsCard
          title="Total Checkpoints"
          value={stats.totalCheckpoints}
          trend={getTrend(stats.totalCheckpoints, previousStats?.totalCheckpoints)}
          icon={<ListBulletIcon className="h-6 w-6" />}
        />
        <StatsCard
          title="Completion Rate"
          value={`${Math.round(completionRate)}%`}
          trend={getTrend(completionRate, previousCompletionRate)}
          icon={<CheckCircleIcon className="h-6 w-6" />}
        />
        <StatsCard
          title="Avg. Duration"
          value={`${Math.round(stats.avgCheckpointDurationMins)} mins`}
          trend={getTrend(stats.avgCheckpointDurationMins, previousStats?.avgCheckpointDurationMins)}
          icon={<ClockIcon className="h-6 w-6" />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <BarChart
          title="Checkpoint Status Distribution"
          data={checkpointData}
          xAxisKey="name"
          bars={[
            {
              key: 'value',
              name: 'Checkpoints',
              color: '#4F46E5',
            },
          ]}
        />
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Most Covered Topics</h3>
          <div className="mt-6 space-y-4">
            {topTopics.map(topic => (
              <div key={topic.name} className="flex items-center">
                <div className="w-32 text-sm text-gray-500">{topic.name}</div>
                <div className="flex-1">
                  <div className="relative h-4 overflow-hidden rounded bg-gray-100">
                    <div
                      className="absolute inset-y-0 left-0 bg-indigo-600"
                      style={{
                        width: `${(topic.value / Math.max(...topTopics.map(t => t.value))) * 100}%`,
                      }}
                    />
                  </div>
                </div>
                <div className="ml-4 w-12 text-right text-sm text-gray-500">{topic.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 