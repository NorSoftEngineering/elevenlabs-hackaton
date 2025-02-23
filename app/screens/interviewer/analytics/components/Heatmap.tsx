import { cn } from '~/utils/cn';

type HeatmapProps = {
	data: Record<string, number>;
	title?: string;
	description?: string;
	className?: string;
	maxValue?: number;
};

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

export function Heatmap({ data, title, description, className, maxValue }: HeatmapProps) {
	const max = maxValue || Math.max(...Object.values(data));

	const getColor = (value: number) => {
		const intensity = value / max;
		return `rgba(79, 70, 229, ${Math.max(0.1, intensity)})`;
	};

	return (
		<div className={cn('rounded-lg bg-white p-6 shadow', className)}>
			{(title || description) && (
				<div className="mb-6">
					{title && <h3 className="text-lg font-medium leading-6 text-gray-900">{title}</h3>}
					{description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
				</div>
			)}
			<div className="overflow-x-auto">
				<div className="min-w-[800px]">
					<div className="grid grid-cols-[auto_repeat(24,minmax(0,1fr))]">
						<div className=""></div>
						{HOURS.map(hour => (
							<div key={hour} className="text-center text-xs text-gray-500">
								{hour}:00
							</div>
						))}
						{DAYS.map((day, dayIndex) => (
							<>
								<div key={day} className="py-1 pr-4 text-sm font-medium text-gray-500">
									{day}
								</div>
								{HOURS.map(hour => {
									const value = data[`${dayIndex}_${hour}`] || 0;
									return (
										<div
											key={`${day}_${hour}`}
											className="m-0.5 h-8 rounded"
											style={{ backgroundColor: getColor(value) }}
											title={`${day} ${hour}:00 - ${value} interviews`}
										/>
									);
								})}
							</>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
