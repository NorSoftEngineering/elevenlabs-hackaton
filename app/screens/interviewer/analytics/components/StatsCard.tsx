import { ArrowDownIcon, ArrowUpIcon } from '@heroicons/react/20/solid';
import { type ReactNode } from 'react';
import { cn } from '~/utils/cn';

type StatsCardProps = {
	title: string;
	value: string | number;
	description?: string;
	trend?: {
		value: number;
		isPositive: boolean;
	};
	icon?: ReactNode;
	className?: string;
};

export function StatsCard({ title, value, description, trend, icon, className }: StatsCardProps) {
	return (
		<div className={cn('rounded-lg bg-white p-6 shadow', className)}>
			<div className="flex items-center justify-between">
				<div>
					<p className="text-sm font-medium text-gray-600">{title}</p>
					<div className="mt-1 flex items-baseline">
						<p className="text-2xl font-semibold text-gray-900">{value}</p>
						{trend && (
							<span
								className={cn(
									'ml-2 flex items-baseline text-sm font-semibold',
									trend.isPositive ? 'text-green-600' : 'text-red-600',
								)}
							>
								{trend.isPositive ? (
									<ArrowUpIcon className="h-4 w-4 flex-shrink-0 self-center text-green-500" aria-hidden="true" />
								) : (
									<ArrowDownIcon className="h-4 w-4 flex-shrink-0 self-center text-red-500" aria-hidden="true" />
								)}
								<span className="sr-only">{trend.isPositive ? 'Increased' : 'Decreased'} by</span>
								{trend.value}%
							</span>
						)}
					</div>
					{description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
				</div>
				{icon && <div className="text-gray-400">{icon}</div>}
			</div>
		</div>
	);
}
