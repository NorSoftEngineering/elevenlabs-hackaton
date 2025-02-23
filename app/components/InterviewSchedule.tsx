import { Dialog } from '@headlessui/react';
import { useState } from 'react';
import { Form } from 'react-router';
import { type InterviewWithRelations } from '~/types';

type Props = {
	interview: InterviewWithRelations;
	canEdit?: boolean;
	onSchedule?: (date: string) => void;
};

export function InterviewSchedule({ interview, onSchedule }: Props) {
	const [isOpen, setIsOpen] = useState(false);

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const formData = new FormData(e.currentTarget);
		const date = formData.get('date') as string;
		const time = formData.get('time') as string;
		console.log('date', date);
		console.log('time', time);
		if (date && time && onSchedule) {
			onSchedule(`${date}T${time}`);
			setIsOpen(false);
		}
	};

	const currentDate = interview.start_at ? new Date(interview.start_at) : new Date();
	const formattedDate = currentDate.toISOString().split('T')[0];
	const formattedTime = currentDate.toTimeString().slice(0, 5);

	return (
		<>
			<Dialog open={isOpen} onClose={() => setIsOpen(false)} className="relative z-50">
				<div className="fixed inset-0 bg-black/30" aria-hidden="true" />

				<div className="fixed inset-0 flex items-center justify-center p-4">
					<Dialog.Panel className="mx-auto max-w-sm rounded-lg bg-white p-6">
						<Dialog.Title className="text-lg font-medium text-gray-900 mb-4">
							{interview.start_at ? 'Reschedule Interview' : 'Schedule Interview'}
						</Dialog.Title>

						<Form method="post" onSubmit={handleSubmit} className="space-y-4">
							<input type="hidden" name="action" value="schedule" />

							<div>
								<label htmlFor="date" className="block text-sm font-medium text-gray-700">
									Date
								</label>
								<input
									type="date"
									name="date"
									id="date"
									defaultValue={formattedDate}
									min={new Date().toISOString().split('T')[0]}
									className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-gray-700"
									required
								/>
							</div>

							<div>
								<label htmlFor="time" className="block text-sm font-medium text-gray-700">
									Time
								</label>
								<input
									type="time"
									name="time"
									id="time"
									defaultValue={formattedTime}
									className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-gray-700"
									required
								/>
							</div>

							<div className="mt-6 flex justify-end gap-3">
								<button
									type="button"
									onClick={() => setIsOpen(false)}
									className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
								>
									Cancel
								</button>
								<button
									type="submit"
									className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
								>
									{interview.start_at ? 'Reschedule' : 'Schedule'}
								</button>
							</div>
						</Form>
					</Dialog.Panel>
				</div>
			</Dialog>
		</>
	);
}
