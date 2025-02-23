import type { Profile } from './profile';

export type InterviewStatus = 'ready' | 'scheduled' | 'confirmed' | 'canceled' | 'done';

export type CandidateProfile = {
	id: string;
	profile_id: string;
	name: string;
	phone: string | null;
	title: string | null;
	experience_years: number | null;
	skills: string[] | null;
	bio: string | null;
	location: string | null;
	resume_url: string | null;
	resume_filename: string | null;
	created_at: string;
	updated_at: string;
};

export type InterviewCandidate = {
	id: string;
	interview_id: string;
	candidate_id: string;
	created_at: string;
	candidate: {
		id: string;
		email: string;
		candidate_profile: CandidateProfile[];
	};
};

export type InterviewInvitation = {
	id: string;
	interview_id: string;
	email: string;
	status: 'pending' | 'accepted' | 'declined';
	created_at: string;
};

export type InterviewInterviewer = {
	id: string;
	interviewer_id: string;
	created_at: string;
	interviewer: Profile;
};

export type InterviewWithRelations = {
	id: string;
	organization_id: string;
	name: string;
	description: string | null;
	status: InterviewStatus;
	start_at: string | null;
	duration: number;
	created_at: string;
	updated_at: string;
	candidates: InterviewCandidate[];
	invitations: InterviewInvitation[];
	interviewers: InterviewInterviewer[];
};
