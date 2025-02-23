import { type Interview, type InterviewInvitation, type InterviewWithRelations } from './types';
import { useSupabase } from './utils/supabase';

export function useInterviews(organizationId: string) {
	const { supabase } = useSupabase();

	const getInterviews = async () => {
		const { data, error } = await supabase
			.from('interviews')
			.select(`
        *,
        candidates:interviews_candidates(*),
        invitations:interviews_invitations(*),
        interviewers:interviews_interviewers(*)
      `)
			.eq('organization_id', organizationId)
			.order('created_at', { ascending: false });

		if (error) throw error;
		return data as unknown as InterviewWithRelations[];
	};

	const getInterview = async (id: string) => {
		const { data, error } = await supabase
			.from('interviews')
			.select(`
        *,
        candidates:interviews_candidates(*),
        invitations:interviews_invitations(*),
        interviewers:interviews_interviewers(*)
      `)
			.eq('id', id)
			.single();

		if (error) throw error;
		return data as unknown as InterviewWithRelations;
	};

	const createInterview = async (interview: Omit<Interview, 'id' | 'created_at' | 'updated_at'>) => {
		const { data, error } = await supabase.from('interviews').insert(interview).select().single();

		if (error) throw error;
		return data as unknown as Interview;
	};

	const updateInterview = async (id: string, updates: Partial<Interview>) => {
		const { data, error } = await supabase.from('interviews').update(updates).eq('id', id).select().single();

		if (error) throw error;
		return data as unknown as Interview;
	};

	const deleteInterview = async (id: string) => {
		const { error } = await supabase.from('interviews').delete().eq('id', id);

		if (error) throw error;
	};

	const createInvitation = async (invitation: Omit<InterviewInvitation, 'id' | 'invited_at' | 'responded_at'>) => {
		const { data, error } = await supabase.from('interviews_invitations').insert(invitation).select().single();

		if (error) throw error;
		return data as unknown as InterviewInvitation;
	};

	const updateInvitation = async (id: string, status: InterviewInvitation['status']) => {
		const { data, error } = await supabase
			.from('interviews_invitations')
			.update({ status })
			.eq('id', id)
			.select()
			.single();

		if (error) throw error;
		return data as unknown as InterviewInvitation;
	};

	return {
		getInterviews,
		getInterview,
		createInterview,
		updateInterview,
		deleteInterview,
		createInvitation,
		updateInvitation,
	};
}
