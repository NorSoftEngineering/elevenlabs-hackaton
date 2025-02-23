import { useCallback, useEffect, useState } from 'react';
import { cn } from '~/lib/utils';

type TimeLeft = {
	days: number;
	hours: number;
	minutes: number;
	seconds: number;
};

type CountdownProps = {
	deadline: string;
	showSeconds?: boolean;
	compact?: boolean;
	className?: string;
};

export function Countdown({ deadline, showSeconds = true, compact = false, className }: CountdownProps) {
	const [timeLeft, setTimeLeft] = useState<TimeLeft>({
		days: 0,
		hours: 0,
		minutes: 0,
		seconds: 0,
	});

	const calculateTimeLeft = useCallback(() => {
		const now = new Date().getTime();
		const endTime = new Date(deadline).getTime();
		const difference = endTime - now;

		if (difference > 0) {
			const days = Math.floor(difference / (1000 * 60 * 60 * 24));
			const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
			const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
			const seconds = Math.floor((difference % (1000 * 60)) / 1000);

			setTimeLeft({ days, hours, minutes, seconds });
		} else {
			setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
		}
	}, [deadline]);

	useEffect(() => {
		calculateTimeLeft();
		const timer = setInterval(calculateTimeLeft, 1000);

		return () => clearInterval(timer);
	}, [calculateTimeLeft]);

	const formatNumber = (num: number) => String(num).padStart(2, '0');

	const getColorClass = () => {
		const totalMinutes = timeLeft.days * 24 * 60 + timeLeft.hours * 60 + timeLeft.minutes;
		if (totalMinutes < 10) return 'text-red-600';
		if (totalMinutes < 30) return 'text-yellow-600';
		return 'text-brand-primary';
	};

	const renderTimeUnit = (value: number, unit: string, showAlways = false) => {
		if (value === 0 && !showAlways) return null;

		return compact ? (
			<span>
				{formatNumber(value)}
				{unit[0]}
			</span>
		) : (
			<span className="inline-flex items-baseline">
				<span className="tabular-nums">{formatNumber(value)}</span>
				<span className="text-xs ml-1 text-gray-500">{unit}</span>
			</span>
		);
	};

	const renderSeparator = () => <span className="mx-1 text-gray-400">{compact ? '' : ':'}</span>;

	return (
		<div className={cn('font-mono text-lg font-bold', className)}>
			<span className={getColorClass()}>
				{timeLeft.days > 0 && (
					<>
						{renderTimeUnit(timeLeft.days, 'days')}
						{renderSeparator()}
					</>
				)}
				{(timeLeft.days > 0 || timeLeft.hours > 0) && (
					<>
						{renderTimeUnit(timeLeft.hours, 'hours', timeLeft.days > 0)}
						{renderSeparator()}
					</>
				)}
				{renderTimeUnit(timeLeft.minutes, 'minutes', true)}
				{showSeconds && (
					<>
						{renderSeparator()}
						{renderTimeUnit(timeLeft.seconds, 'seconds', true)}
					</>
				)}
			</span>
		</div>
	);
}
