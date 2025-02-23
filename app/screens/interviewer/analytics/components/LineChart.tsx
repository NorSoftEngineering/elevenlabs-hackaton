import { type ReactNode } from 'react';
import {
	CartesianGrid,
	Legend,
	Line,
	LineChart as RechartsLineChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from 'recharts';
import { cn } from '~/utils/cn';

type LineChartProps = {
	data: Array<Record<string, any>>;
	xAxisKey: string;
	lines: Array<{
		key: string;
		color: string;
		name: string;
	}>;
	title?: string;
	description?: string;
	className?: string;
	height?: number;
	tooltip?: ReactNode;
};

export function LineChart({
	data,
	xAxisKey,
	lines,
	title,
	description,
	className,
	height = 300,
	tooltip,
}: LineChartProps) {
	return (
		<div className={cn('rounded-lg bg-white p-6 shadow', className)}>
			{(title || description) && (
				<div className="mb-6">
					{title && <h3 className="text-lg font-medium leading-6 text-gray-900">{title}</h3>}
					{description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
				</div>
			)}
			<div style={{ width: '100%', height }}>
				<ResponsiveContainer>
					<RechartsLineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
						<CartesianGrid strokeDasharray="3 3" />
						<XAxis dataKey={xAxisKey} />
						<YAxis />
						<Tooltip content={tooltip} />
						<Legend />
						{lines.map(line => (
							<Line
								key={line.key}
								type="monotone"
								dataKey={line.key}
								stroke={line.color}
								name={line.name}
								dot={false}
							/>
						))}
					</RechartsLineChart>
				</ResponsiveContainer>
			</div>
		</div>
	);
}
