import { useState } from 'react';
import { useParams, Link } from 'react-router';

interface Interview {
  id: string;
  companyName: string;
  position: string;
  date: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  interviewer: {
    name: string;
    title: string;
    email: string;
  };
  location: {
    type: 'remote' | 'onsite';
    details: string;
  };
  notes: string;
  agenda: {
    time: string;
    activity: string;
  }[];
}

export default function InterviewScreen() {
  const { id } = useParams();
  const [interview] = useState<Interview>({
    id: '1',
    companyName: 'Example Corp',
    position: 'Software Engineer',
    date: '2024-03-20T14:00:00Z',
    status: 'scheduled',
    interviewer: {
      name: 'Jane Smith',
      title: 'Engineering Manager',
      email: 'jane@example.com',
    },
    location: {
      type: 'remote',
      details: 'Zoom link will be sent 1 hour before the interview',
    },
    notes: 'Please prepare for technical questions and have a recent project ready to discuss.',
    agenda: [
      { time: '14:00', activity: 'Introduction and Background Discussion' },
      { time: '14:15', activity: 'Technical Interview' },
      { time: '15:00', activity: 'System Design Discussion' },
      { time: '15:30', activity: 'Team Fit and Culture' },
      { time: '15:45', activity: 'Q&A' },
    ],
  });

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Link
            to="/candidate/interviews"
            className="text-blue-600 hover:text-blue-800 mb-2 inline-block"
          >
            ← Back to Interviews
          </Link>
          <h1 className="text-2xl font-bold">{interview.position} at {interview.companyName}</h1>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-semibold
          ${interview.status === 'scheduled' ? 'bg-yellow-100 text-yellow-800' : ''}
          ${interview.status === 'completed' ? 'bg-green-100 text-green-800' : ''}
          ${interview.status === 'cancelled' ? 'bg-red-100 text-red-800' : ''}
        `}>
          {interview.status.charAt(0).toUpperCase() + interview.status.slice(1)}
        </span>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <section className="mb-6">
                <h2 className="text-lg font-semibold mb-3">Interview Details</h2>
                <div className="space-y-2">
                  <p>
                    <span className="text-gray-600">Date:</span>{' '}
                    {new Date(interview.date).toLocaleString()}
                  </p>
                  <p>
                    <span className="text-gray-600">Location:</span>{' '}
                    {interview.location.type === 'remote' ? '🌐 Remote' : '🏢 On-site'}
                  </p>
                  <p className="text-sm text-gray-600">{interview.location.details}</p>
                </div>
              </section>

              <section className="mb-6">
                <h2 className="text-lg font-semibold mb-3">Interviewer</h2>
                <div className="space-y-2">
                  <p>{interview.interviewer.name}</p>
                  <p className="text-gray-600">{interview.interviewer.title}</p>
                  <p className="text-sm">
                    <a
                      href={`mailto:${interview.interviewer.email}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {interview.interviewer.email}
                    </a>
                  </p>
                </div>
              </section>
            </div>

            <div>
              <section className="mb-6">
                <h2 className="text-lg font-semibold mb-3">Agenda</h2>
                <div className="space-y-2">
                  {interview.agenda.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-start py-2 border-b border-gray-100 last:border-0"
                    >
                      <span className="text-gray-600 w-20">{item.time}</span>
                      <span>{item.activity}</span>
                    </div>
                  ))}
                </div>
              </section>

              {interview.notes && (
                <section>
                  <h2 className="text-lg font-semibold mb-3">Additional Notes</h2>
                  <p className="text-gray-700 whitespace-pre-line">{interview.notes}</p>
                </section>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 