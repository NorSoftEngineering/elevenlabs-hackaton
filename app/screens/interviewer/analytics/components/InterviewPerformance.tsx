import { CalendarIcon, CheckCircleIcon, ClockIcon } from '@heroicons/react/24/outline';
import { BarChart } from './BarChart';
import { Heatmap } from './Heatmap';
import { StatsCard } from './StatsCard';

type InterviewPerformanceProps = {
	stats: {
		totalInterviews: number;
		completedInterviews: number;
		scheduledInterviews: number;
		avgDurationHours: number;
		timeDistribution: Record<string, number>;
	};
	previousStats?: {
		totalInterviews: number;
		completedInterviews: number;
		avgDurationHours: number;
	};
};

export function InterviewPerformance({ stats, previousStats }: InterviewPerformanceProps) {
	const completionRate = stats.totalInterviews === 0 ? 0 : (stats.completedInterviews / stats.totalInterviews) * 100;
	const previousCompletionRate =
		previousStats?.totalInterviews === 0
			? 0
			: previousStats
				? (previousStats.completedInterviews / previousStats.totalInterviews) * 100
				: undefined;

	const getTrend = (current: number, previous: number | undefined) => {
		if (!previous) return undefined;
		const change = ((current - previous) / previous) * 100;
		return {
			value: Math.abs(Math.round(change)),
			isPositive: change > 0,
		};
	};

	const durationData = [
		{ name: 'Completed', value: stats.completedInterviews },
		{ name: 'Scheduled', value: stats.scheduledInterviews },
	];

	return (
		<div className="space-y-6">
			<h2 className="text-xl font-semibold text-gray-900">Interview Performance</h2>
			<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
				<StatsCard
					title="Total Interviews"
					value={stats.totalInterviews}
					trend={getTrend(stats.totalInterviews, previousStats?.totalInterviews)}
					icon={<CalendarIcon className="h-6 w-6" />}
				/>
				<StatsCard
					title="Completion Rate"
					value={`${Math.round(completionRate)}%`}
					trend={getTrend(completionRate, previousCompletionRate)}
					icon={<CheckCircleIcon className="h-6 w-6" />}
				/>
				<StatsCard
					title="Average Duration"
					value={`${Math.round(stats.avgDurationHours)} hours`}
					trend={getTrend(stats.avgDurationHours, previousStats?.avgDurationHours)}
					icon={<ClockIcon className="h-6 w-6" />}
				/>
			</div>

			<div className="grid gap-6 lg:grid-cols-2">
				<BarChart
					title="Interview Status Distribution"
					data={durationData}
					xAxisKey="name"
					bars={[
						{
							key: 'value',
							name: 'Interviews',
							color: '#4F46E5',
						},
					]}
				/>
				<Heatmap
					title="Interview Time Distribution"
					data={stats.timeDistribution}
					description="Number of interviews by day and hour"
				/>
			</div>
		</div>
	);
}
