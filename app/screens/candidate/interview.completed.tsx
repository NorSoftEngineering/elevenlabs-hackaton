import { Link } from 'react-router';
import { type LoaderFunctionArgs, redirect, useLoaderData } from 'react-router';
import { Card } from '~/components/ui/card';
import { cn } from '~/lib/utils';
import { createSupabaseServer } from '~/utils/supabase.server';
import { CheckCircle2, Clock, FileText, ExternalLink } from 'lucide-react';
import { useState } from 'react';

type InterviewComplete = {
	id: string;
	name: string;
	status: string;
	started_date: Date;
	completed_date: Date;
	brief_result: string;
	organization_name: string;
	duration: string;
};

// Add helper function to convert milliseconds to duration string
const millisecondsToHHMM = (milliseconds: number): string => {
	const hours = Math.floor(milliseconds / (1000 * 60 * 60));
	const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
	return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

const STANDARD_DURATION_MINUTES = 60;

// Add helper function to get completion message
const getCompletionMessage = (durationMinutes: number): { message: string; color: string } => {
	const timeSaved = STANDARD_DURATION_MINUTES - durationMinutes;

	if (durationMinutes < 15) {
		return {
			message: `Incredible speed! You saved ${timeSaved} minutes 🚀`,
			color: 'text-purple-600',
		};
	} else if (durationMinutes < 30) {
		return {
			message: `Great pace! You saved ${timeSaved} minutes ⭐️`,
			color: 'text-blue-600',
		};
	} else if (durationMinutes < 45) {
		return {
			message: `Well done! You saved ${timeSaved} minutes 👏`,
			color: 'text-green-600',
		};
	} else {
		return {
			message: 'Completed successfully! 🎉',
			color: 'text-brand-primary',
		};
	}
};

export async function loader({ request, params }: LoaderFunctionArgs) {
	const supabase = createSupabaseServer(request, new Headers());
	const interviewId = params.id;

	const { data: sessionData } = await supabase.auth.getSession();

	if (!sessionData.session) {
		throw redirect('/login');
	}

	// Get completed interview
	const { data: interview } = await supabase
		.from('interviews')
		.select(`
			id,
			name,
			status,
			started_date,
            completed_date,
			brief_result
		`)
		.eq('id', interviewId)
		.single();

	if (!interview || interview.status !== 'done') {
		throw redirect('/candidate/interviews');
	}

	return {
		interview,
	};
}

export default function InterviewComplete() {
	const { interview } = useLoaderData<{ interview: InterviewComplete }>();

	const getDurationInMinutes = (): number => {
		const durationMs = new Date(interview.completed_date).getTime() - new Date(interview.started_date).getTime();
		return Math.floor(durationMs / (1000 * 60));
	};

	const durationMinutes = getDurationInMinutes();
	const completionFeedback = getCompletionMessage(durationMinutes);
	const isGoogleDoc = interview.brief_result?.includes('docs.google.com');

	return (
		<div className="p-6 max-w-4xl mx-auto">
			<div className="flex justify-between items-center mb-8">
				<h1 className="text-2xl font-bold text-gray-700">Interview Summary</h1>
				<Link to="/candidate/interviews" className="text-brand-primary hover:text-brand-secondary font-medium text-sm">
					← Back to Interviews
				</Link>
			</div>

			<Card className="bg-white shadow-lg overflow-hidden mb-8">
				<div className="p-6">
					<div className="flex justify-between items-start mb-6">
						<div>
							<h2 className="text-xl font-semibold text-gray-900">{interview.name}</h2>
							<p className="text-sm text-gray-600 mt-1">{interview.organization_name}</p>
						</div>
						<span
							className={cn('px-3 py-1 rounded-full text-sm font-medium', {
								'bg-green-100 text-green-800': interview.status === 'done',
							})}
						>
							<div className="flex items-center gap-2">
								<CheckCircle2 className="w-4 h-4" />
								Completed
							</div>
						</span>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
						<div className="space-y-2">
							<div className="flex items-center gap-2 text-gray-600">
								<Clock className="w-4 h-4" />
								<span className="text-sm font-medium">Started At</span>
							</div>
							<p className="text-sm text-gray-900">{new Date(interview.started_date).toLocaleString()}</p>
						</div>

						<div className="space-y-2">
							<div className="flex items-center gap-2 text-gray-600">
								<CheckCircle2 className="w-4 h-4" />
								<span className="text-sm font-medium">Completed At</span>
							</div>
							<p className="text-sm text-gray-900">{new Date(interview.completed_date).toLocaleString()}</p>
						</div>

						<div className="space-y-2">
							<div className="flex items-center gap-2 text-gray-600">
								<Clock className="w-4 h-4" />
								<span className="text-sm font-medium">Duration</span>
							</div>
							<div className="space-y-1">
								<p className="text-sm text-gray-900">
									{millisecondsToHHMM(
										new Date(interview.completed_date).getTime() - new Date(interview.started_date).getTime(),
									)}
								</p>
								<p className={cn('text-sm font-medium', completionFeedback.color)}>{completionFeedback.message}</p>
							</div>
						</div>
					</div>
				</div>
			</Card>

			<Card className="bg-white shadow-lg overflow-hidden">
				<div className="p-6">
					<h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
						<FileText className="w-5 h-5 text-brand-primary" />
						Interview Results
					</h3>

					<div className="space-y-4">
						<p className="text-sm text-gray-600">
							{isGoogleDoc
								? 'Unable to embed document. Please use the link below to view.'
								: 'Results are available via the link below.'}
						</p>
						<a
							href={interview.brief_result}
							target="_blank"
							rel="noopener noreferrer"
							className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-secondary transition-colors"
						>
							View Results
							<ExternalLink className="w-4 h-4" />
						</a>
					</div>
				</div>
			</Card>
		</div>
	);
}
