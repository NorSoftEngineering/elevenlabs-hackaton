export type CandidateProfile = {
	id: string;
	user_id: string;
	bio: string | null;
	skills: string[] | null;
	experience:
		| {
				title: string;
				company: string;
				start_date: string;
				end_date: string | null;
				description: string;
		  }[]
		| null;
	education:
		| {
				school: string;
				degree: string;
				field: string;
				graduation_year: number;
		  }[]
		| null;
	location: string | null;
	created_at?: string;
	updated_at?: string;
};

export type Interview = {
	id: string;
	candidate_id: string;
	organization_id: string;
	position: string;
	start_datetime: string;
	duration: number;
	status: 'scheduled' | 'completed' | 'cancelled';
	meeting_link?: string;
	feedback?: string;
	created_at?: string;
	updated_at?: string;
	// Joined fields
	organization_name?: string;
};
