import { useState } from 'react';
import { useNavigate } from 'react-router';

interface Interview {
	id: string;
	companyName: string;
	position: string;
	date: string;
	status: 'scheduled' | 'completed' | 'cancelled';
}

export default function InterviewsScreen() {
	const navigate = useNavigate();
	const [interviews] = useState<Interview[]>([
		// Placeholder data
		{
			id: '1',
			companyName: 'Example Corp',
			position: 'Software Engineer',
			date: '2024-03-20',
			status: 'scheduled',
		},
	]);

	return (
		<div className="p-6">
			<h1 className="text-2xl font-bold mb-6 text-brand-primary">My Interviews</h1>

			<div className="bg-white rounded-lg shadow overflow-hidden">
				<table className="min-w-full divide-y divide-gray-200">
					<thead className="bg-gray-50">
						<tr>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Company
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Position
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
						</tr>
					</thead>
					<tbody className="bg-white divide-y divide-gray-200">
						{interviews.map(interview => (
							<tr
								key={interview.id}
								onClick={() => navigate(`/candidate/interviews/${interview.id}`)}
								className="cursor-pointer hover:bg-gray-50"
							>
								<td className="px-6 py-4 whitespace-nowrap">
									<div className="text-sm font-medium text-gray-900">{interview.companyName}</div>
								</td>
								<td className="px-6 py-4 whitespace-nowrap">
									<div className="text-sm text-gray-900">{interview.position}</div>
								</td>
								<td className="px-6 py-4 whitespace-nowrap">
									<div className="text-sm text-gray-900">{new Date(interview.date).toLocaleDateString()}</div>
								</td>
								<td className="px-6 py-4 whitespace-nowrap">
									<span
										className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                    ${interview.status === 'scheduled' ? 'bg-yellow-100 text-yellow-800' : ''}
                    ${interview.status === 'completed' ? 'bg-green-100 text-green-800' : ''}
                    ${interview.status === 'cancelled' ? 'bg-red-100 text-red-800' : ''}
                  `}
									>
										{interview.status.charAt(0).toUpperCase() + interview.status.slice(1)}
									</span>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}
