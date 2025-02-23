export type CandidateProfile = {
  experience_years: number;
  skills: string[];
};

export type CandidateData = {
  candidate_id: string;
  interviews: {
    organization_id: string;
    created_at: string;
  }[];
  profiles: {
    candidate_profiles: CandidateProfile[];
  }[];
};

export type AnalyticsData = {
  interviewStats: {
    totalInterviews: number;
    completedInterviews: number;
    scheduledInterviews: number;
    avgDurationHours: number;
    timeDistribution: Record<string, number>;
  };
  candidateStats: {
    totalCandidates: number;
    acceptedInvitations: number;
    totalInvitations: number;
    avgExperienceYears: number;
    allSkills: string[];
  };
  checkpointStats: {
    totalCheckpoints: number;
    completedCheckpoints: number;
    avgCheckpointDurationMins: number;
    allTopics: string[];
  };
  organizationStats: {
    activeInterviewers: number;
    interviewsPerInterviewer: number;
    memberRoles: string[];
  };
  volumeData: Array<{
    date: string;
    interviews: number;
  }>;
}; 