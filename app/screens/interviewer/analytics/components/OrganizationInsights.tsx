import { ChartBarIcon, ClockIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { cn } from '~/utils/cn';
import { BarChart } from './BarChart';
import { LineChart } from './LineChart';
import { StatsCard } from './StatsCard';

type OrganizationInsightsProps = {
	stats: {
		activeInterviewers: number;
		interviewsPerInterviewer: number;
		memberRoles: string[];
	};
	volumeData: Array<{
		date: string;
		interviews: number;
	}>;
	previousStats?: {
		activeInterviewers: number;
		interviewsPerInterviewer: number;
	};
};

export function OrganizationInsights({ stats, volumeData, previousStats }: OrganizationInsightsProps) {
	const getTrend = (current: number, previous: number | undefined) => {
		if (!previous || previous === 0) return undefined;
		const change = ((current - previous) / previous) * 100;
		return {
			value: Math.abs(Math.round(change)) || 0,
			isPositive: change > 0,
		};
	};

	// Group roles by frequency
	const roleFrequency = stats.memberRoles.reduce(
		(acc, role) => {
			acc[role] = (acc[role] || 0) + 1;
			return acc;
		},
		{} as Record<string, number>,
	);

	const roleData = Object.entries(roleFrequency).map(([name, value]) => ({
		name,
		value,
	}));

	return (
		<div className="space-y-6">
			<h2 className="text-xl font-semibold text-gray-900">Organization Insights</h2>
			<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
				<StatsCard
					title="Active Interviewers"
					value={stats.activeInterviewers}
					trend={getTrend(stats.activeInterviewers, previousStats?.activeInterviewers)}
					icon={<UserGroupIcon className="h-6 w-6" />}
				/>
				<StatsCard
					title="Interviews per Interviewer"
					value={Math.round(stats.interviewsPerInterviewer * 10) / 10}
					trend={getTrend(stats.interviewsPerInterviewer, previousStats?.interviewsPerInterviewer)}
					icon={<ChartBarIcon className="h-6 w-6" />}
				/>
				<StatsCard title="Member Roles" value={stats.memberRoles.length} icon={<ClockIcon className="h-6 w-6" />} />
			</div>

			<div className="grid gap-6 lg:grid-cols-2">
				<LineChart
					title="Interview Volume Trends"
					data={volumeData}
					xAxisKey="date"
					lines={[
						{
							key: 'interviews',
							name: 'Interviews',
							color: '#4F46E5',
						},
					]}
				/>
				<BarChart
					title="Member Role Distribution"
					data={roleData}
					xAxisKey="name"
					bars={[
						{
							key: 'value',
							name: 'Members',
							color: '#4F46E5',
						},
					]}
				/>
			</div>
		</div>
	);
}
