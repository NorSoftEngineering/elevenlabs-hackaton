import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import type { AnalyticsData } from '../types';

type ExportButtonProps = {
  data: AnalyticsData;
};

export function ExportButton({ data }: ExportButtonProps) {
  const handleExport = () => {
    // Prepare CSV data
    const csvData = [
      // Interview Performance
      ['Interview Performance'],
      ['Metric', 'Value'],
      ['Total Interviews', data.interviewStats.totalInterviews],
      ['Completed Interviews', data.interviewStats.completedInterviews],
      ['Scheduled Interviews', data.interviewStats.scheduledInterviews],
      ['Average Duration (hours)', data.interviewStats.avgDurationHours],
      [],
      // Candidate Metrics
      ['Candidate Metrics'],
      ['Metric', 'Value'],
      ['Total Candidates', data.candidateStats.totalCandidates],
      ['Accepted Invitations', data.candidateStats.acceptedInvitations],
      ['Total Invitations', data.candidateStats.totalInvitations],
      ['Average Experience (years)', data.candidateStats.avgExperienceYears],
      [],
      // Checkpoint Analysis
      ['Checkpoint Analysis'],
      ['Metric', 'Value'],
      ['Total Checkpoints', data.checkpointStats.totalCheckpoints],
      ['Completed Checkpoints', data.checkpointStats.completedCheckpoints],
      ['Average Duration (mins)', data.checkpointStats.avgCheckpointDurationMins],
      [],
      // Organization Insights
      ['Organization Insights'],
      ['Metric', 'Value'],
      ['Active Interviewers', data.organizationStats.activeInterviewers],
      ['Interviews per Interviewer', data.organizationStats.interviewsPerInterviewer],
      [],
      // Volume Data
      ['Interview Volume'],
      ['Date', 'Interviews'],
      ...data.volumeData.map((d: { date: string; interviews: number }) => [d.date, d.interviews]),
    ]
      .map(row => row.join(','))
      .join('\n');

    // Create and download the file
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={handleExport}
      className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
    >
      <ArrowDownTrayIcon className="h-4 w-4" />
      Export CSV
    </button>
  );
} 