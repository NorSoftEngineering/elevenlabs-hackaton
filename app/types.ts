export type InterviewStatus = 'ready' | 'scheduled' | 'canceled' | 'confirmed' | 'done';
export type InvitationStatus = 'pending' | 'accepted' | 'declined';

export interface Interview {
	id: string;
	organization_id: string;
	name: string;
	description?: string;
	duration: string; // ISO 8601 duration
	start_at?: string; // ISO 8601 datetime
	status: InterviewStatus;
	created_at: string;
	updated_at: string;
}

export interface User {
	id: string;
	email: string;
}

export interface InterviewCandidate {
	id: string;
	interview_id: string;
	candidate_id: string;
	created_at: string;
	candidate: User;
}

export interface InterviewInvitation {
	id: string;
	interview_id: string;
	email: string;
	status: InvitationStatus;
	invited_at: string;
	responded_at?: string;
}

export interface InterviewInterviewer {
	id: string;
	interview_id: string;
	interviewer_id: string;
	created_at: string;
	interviewer: User;
}

export interface InterviewWithRelations extends Interview {
	candidates?: InterviewCandidate[];
	invitations?: InterviewInvitation[];
	interviewers?: InterviewInterviewer[];
}
