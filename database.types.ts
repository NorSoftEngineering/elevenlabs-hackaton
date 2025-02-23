export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
	public: {
		Tables: {
			candidate_profiles: {
				Row: {
					bio: string | null;
					created_at: string;
					experience_years: number | null;
					id: string;
					location: string | null;
					name: string | null;
					phone: string | null;
					profile_id: string;
					resume_filename: string | null;
					resume_url: string | null;
					skills: string[] | null;
					title: string | null;
					updated_at: string;
				};
				Insert: {
					bio?: string | null;
					created_at?: string;
					experience_years?: number | null;
					id?: string;
					location?: string | null;
					name?: string | null;
					phone?: string | null;
					profile_id: string;
					resume_filename?: string | null;
					resume_url?: string | null;
					skills?: string[] | null;
					title?: string | null;
					updated_at?: string;
				};
				Update: {
					bio?: string | null;
					created_at?: string;
					experience_years?: number | null;
					id?: string;
					location?: string | null;
					name?: string | null;
					phone?: string | null;
					profile_id?: string;
					resume_filename?: string | null;
					resume_url?: string | null;
					skills?: string[] | null;
					title?: string | null;
					updated_at?: string;
				};
				Relationships: [
					{
						foreignKeyName: 'candidate_profiles_profile_id_fkey';
						columns: ['profile_id'];
						isOneToOne: true;
						referencedRelation: 'profiles';
						referencedColumns: ['id'];
					},
				];
			};
			debug_auth: {
				Row: {
					auth_uid: string | null;
					created_at: string | null;
					id: string;
				};
				Insert: {
					auth_uid?: string | null;
					created_at?: string | null;
					id?: string;
				};
				Update: {
					auth_uid?: string | null;
					created_at?: string | null;
					id?: string;
				};
				Relationships: [];
			};
			email_logs: {
				Row: {
					created_at: string;
					email: string | null;
					id: number;
					subject: string | null;
					time_sent: string | null;
					type: string | null;
				};
				Insert: {
					created_at?: string;
					email?: string | null;
					id?: number;
					subject?: string | null;
					time_sent?: string | null;
					type?: string | null;
				};
				Update: {
					created_at?: string;
					email?: string | null;
					id?: number;
					subject?: string | null;
					time_sent?: string | null;
					type?: string | null;
				};
				Relationships: [];
			};
			interview_checkpoints: {
				Row: {
					analysis: Json | null;
					checkpoint_id: number | null;
					completed_at: string | null;
					covered_topics: string[];
					created_at: string | null;
					description: string | null;
					id: number;
					interview_id: string | null;
					title: string | null;
					updated_at: string | null;
				};
				Insert: {
					analysis?: Json | null;
					checkpoint_id?: number | null;
					completed_at?: string | null;
					covered_topics?: string[];
					created_at?: string | null;
					description?: string | null;
					id?: number;
					interview_id?: string | null;
					title?: string | null;
					updated_at?: string | null;
				};
				Update: {
					analysis?: Json | null;
					checkpoint_id?: number | null;
					completed_at?: string | null;
					covered_topics?: string[];
					created_at?: string | null;
					description?: string | null;
					id?: number;
					interview_id?: string | null;
					title?: string | null;
					updated_at?: string | null;
				};
				Relationships: [
					{
						foreignKeyName: 'interview_checkpoints_interview_id_fkey';
						columns: ['interview_id'];
						isOneToOne: false;
						referencedRelation: 'interview_details';
						referencedColumns: ['id'];
					},
					{
						foreignKeyName: 'interview_checkpoints_interview_id_fkey';
						columns: ['interview_id'];
						isOneToOne: false;
						referencedRelation: 'interviews';
						referencedColumns: ['id'];
					},
				];
			};
			interview_events: {
				Row: {
					actor_id: string;
					created_at: string;
					event_type: string;
					id: string;
					interview_id: string;
					metadata: Json | null;
				};
				Insert: {
					actor_id: string;
					created_at?: string;
					event_type: string;
					id?: string;
					interview_id: string;
					metadata?: Json | null;
				};
				Update: {
					actor_id?: string;
					created_at?: string;
					event_type?: string;
					id?: string;
					interview_id?: string;
					metadata?: Json | null;
				};
				Relationships: [
					{
						foreignKeyName: 'interview_events_actor_id_fkey';
						columns: ['actor_id'];
						isOneToOne: false;
						referencedRelation: 'profiles';
						referencedColumns: ['id'];
					},
					{
						foreignKeyName: 'interview_events_interview_id_fkey';
						columns: ['interview_id'];
						isOneToOne: false;
						referencedRelation: 'interview_details';
						referencedColumns: ['id'];
					},
					{
						foreignKeyName: 'interview_events_interview_id_fkey';
						columns: ['interview_id'];
						isOneToOne: false;
						referencedRelation: 'interviews';
						referencedColumns: ['id'];
					},
				];
			};
			interviews: {
				Row: {
					brief_result: string | null;
					created_at: string;
					deadline: string | null;
					description: string | null;
					duration: unknown;
					elevenlabs_conversation_id: string | null;
					elevenlabs_signed_url: string | null;
					id: string;
					messages: Json | null;
					name: string;
					organization_id: string;
					start_at: string | null;
					status: Database['public']['Enums']['interview_status'];
					updated_at: string;
				};
				Insert: {
					brief_result?: string | null;
					created_at?: string;
					deadline?: string | null;
					description?: string | null;
					duration?: unknown;
					elevenlabs_conversation_id?: string | null;
					elevenlabs_signed_url?: string | null;
					id?: string;
					messages?: Json | null;
					name: string;
					organization_id: string;
					start_at?: string | null;
					status?: Database['public']['Enums']['interview_status'];
					updated_at?: string;
				};
				Update: {
					brief_result?: string | null;
					created_at?: string;
					deadline?: string | null;
					description?: string | null;
					duration?: unknown;
					elevenlabs_conversation_id?: string | null;
					elevenlabs_signed_url?: string | null;
					id?: string;
					messages?: Json | null;
					name?: string;
					organization_id?: string;
					start_at?: string | null;
					status?: Database['public']['Enums']['interview_status'];
					updated_at?: string;
				};
				Relationships: [
					{
						foreignKeyName: 'interviews_organization_id_fkey';
						columns: ['organization_id'];
						isOneToOne: false;
						referencedRelation: 'organizations';
						referencedColumns: ['id'];
					},
				];
			};
			interviews_candidates: {
				Row: {
					candidate_id: string;
					created_at: string;
					id: string;
					interview_id: string;
				};
				Insert: {
					candidate_id: string;
					created_at?: string;
					id?: string;
					interview_id: string;
				};
				Update: {
					candidate_id?: string;
					created_at?: string;
					id?: string;
					interview_id?: string;
				};
				Relationships: [
					{
						foreignKeyName: 'interviews_candidates_candidate_id_fkey';
						columns: ['candidate_id'];
						isOneToOne: false;
						referencedRelation: 'profiles';
						referencedColumns: ['id'];
					},
					{
						foreignKeyName: 'interviews_candidates_interview_id_fkey';
						columns: ['interview_id'];
						isOneToOne: false;
						referencedRelation: 'interview_details';
						referencedColumns: ['id'];
					},
					{
						foreignKeyName: 'interviews_candidates_interview_id_fkey';
						columns: ['interview_id'];
						isOneToOne: false;
						referencedRelation: 'interviews';
						referencedColumns: ['id'];
					},
				];
			};
			interviews_interviewers: {
				Row: {
					created_at: string;
					id: string;
					interview_id: string;
					interviewer_id: string;
				};
				Insert: {
					created_at?: string;
					id?: string;
					interview_id: string;
					interviewer_id: string;
				};
				Update: {
					created_at?: string;
					id?: string;
					interview_id?: string;
					interviewer_id?: string;
				};
				Relationships: [
					{
						foreignKeyName: 'interviews_interviewers_interview_id_fkey';
						columns: ['interview_id'];
						isOneToOne: false;
						referencedRelation: 'interview_details';
						referencedColumns: ['id'];
					},
					{
						foreignKeyName: 'interviews_interviewers_interview_id_fkey';
						columns: ['interview_id'];
						isOneToOne: false;
						referencedRelation: 'interviews';
						referencedColumns: ['id'];
					},
					{
						foreignKeyName: 'interviews_interviewers_interviewer_id_fkey1';
						columns: ['interviewer_id'];
						isOneToOne: false;
						referencedRelation: 'profiles';
						referencedColumns: ['id'];
					},
				];
			};
			interviews_invitations: {
				Row: {
					email: string;
					id: string;
					interview_id: string;
					invited_at: string;
					rescheduled_at: string | null;
					responded_at: string | null;
					status: Database['public']['Enums']['invitation_status'];
					updated_at: string | null;
				};
				Insert: {
					email: string;
					id?: string;
					interview_id: string;
					invited_at?: string;
					rescheduled_at?: string | null;
					responded_at?: string | null;
					status?: Database['public']['Enums']['invitation_status'];
					updated_at?: string | null;
				};
				Update: {
					email?: string;
					id?: string;
					interview_id?: string;
					invited_at?: string;
					rescheduled_at?: string | null;
					responded_at?: string | null;
					status?: Database['public']['Enums']['invitation_status'];
					updated_at?: string | null;
				};
				Relationships: [
					{
						foreignKeyName: 'interviews_invitations_interview_id_fkey';
						columns: ['interview_id'];
						isOneToOne: false;
						referencedRelation: 'interview_details';
						referencedColumns: ['id'];
					},
					{
						foreignKeyName: 'interviews_invitations_interview_id_fkey';
						columns: ['interview_id'];
						isOneToOne: false;
						referencedRelation: 'interviews';
						referencedColumns: ['id'];
					},
				];
			};
			organization_members: {
				Row: {
					created_at: string | null;
					id: string;
					organization_id: string | null;
					role: string;
					updated_at: string | null;
					user_id: string | null;
				};
				Insert: {
					created_at?: string | null;
					id?: string;
					organization_id?: string | null;
					role: string;
					updated_at?: string | null;
					user_id?: string | null;
				};
				Update: {
					created_at?: string | null;
					id?: string;
					organization_id?: string | null;
					role?: string;
					updated_at?: string | null;
					user_id?: string | null;
				};
				Relationships: [
					{
						foreignKeyName: 'organization_members_organization_id_fkey';
						columns: ['organization_id'];
						isOneToOne: false;
						referencedRelation: 'organizations';
						referencedColumns: ['id'];
					},
				];
			};
			organizations: {
				Row: {
					created_at: string | null;
					id: string;
					name: string;
					owner_id: string | null;
					slug: string;
					updated_at: string | null;
				};
				Insert: {
					created_at?: string | null;
					id?: string;
					name: string;
					owner_id?: string | null;
					slug: string;
					updated_at?: string | null;
				};
				Update: {
					created_at?: string | null;
					id?: string;
					name?: string;
					owner_id?: string | null;
					slug?: string;
					updated_at?: string | null;
				};
				Relationships: [];
			};
			profiles: {
				Row: {
					created_at: string | null;
					email: string;
					id: string;
					role: Database['public']['Enums']['user_role'] | null;
					updated_at: string | null;
				};
				Insert: {
					created_at?: string | null;
					email: string;
					id: string;
					role?: Database['public']['Enums']['user_role'] | null;
					updated_at?: string | null;
				};
				Update: {
					created_at?: string | null;
					email?: string;
					id?: string;
					role?: Database['public']['Enums']['user_role'] | null;
					updated_at?: string | null;
				};
				Relationships: [];
			};
		};
		Views: {
			candidate_interviews: {
				Row: {
					candidate_email: string | null;
					candidate_id: string | null;
					created_at: string | null;
					id: string | null;
					interview_description: string | null;
					interview_duration: unknown | null;
					interview_id: string | null;
					interview_name: string | null;
					interview_start_at: string | null;
					interview_status: Database['public']['Enums']['interview_status'] | null;
					organization_name: string | null;
				};
				Relationships: [
					{
						foreignKeyName: 'interviews_candidates_candidate_id_fkey';
						columns: ['candidate_id'];
						isOneToOne: false;
						referencedRelation: 'profiles';
						referencedColumns: ['id'];
					},
					{
						foreignKeyName: 'interviews_candidates_interview_id_fkey';
						columns: ['interview_id'];
						isOneToOne: false;
						referencedRelation: 'interview_details';
						referencedColumns: ['id'];
					},
					{
						foreignKeyName: 'interviews_candidates_interview_id_fkey';
						columns: ['interview_id'];
						isOneToOne: false;
						referencedRelation: 'interviews';
						referencedColumns: ['id'];
					},
				];
			};
			candidate_invitations: {
				Row: {
					email: string | null;
					id: string | null;
					interview_description: string | null;
					interview_duration: unknown | null;
					interview_id: string | null;
					interview_name: string | null;
					interview_start_at: string | null;
					interview_status: Database['public']['Enums']['interview_status'] | null;
					invited_at: string | null;
					organization_name: string | null;
					responded_at: string | null;
					status: Database['public']['Enums']['invitation_status'] | null;
				};
				Relationships: [
					{
						foreignKeyName: 'interviews_invitations_interview_id_fkey';
						columns: ['interview_id'];
						isOneToOne: false;
						referencedRelation: 'interview_details';
						referencedColumns: ['id'];
					},
					{
						foreignKeyName: 'interviews_invitations_interview_id_fkey';
						columns: ['interview_id'];
						isOneToOne: false;
						referencedRelation: 'interviews';
						referencedColumns: ['id'];
					},
				];
			};
			interview_details: {
				Row: {
					created_at: string | null;
					description: string | null;
					duration: unknown | null;
					id: string | null;
					messages: Json | null;
					name: string | null;
					organization_id: string | null;
					organization_name: string | null;
					start_at: string | null;
					status: Database['public']['Enums']['interview_status'] | null;
					updated_at: string | null;
				};
				Relationships: [
					{
						foreignKeyName: 'interviews_organization_id_fkey';
						columns: ['organization_id'];
						isOneToOne: false;
						referencedRelation: 'organizations';
						referencedColumns: ['id'];
					},
				];
			};
			member_profiles: {
				Row: {
					created_at: string | null;
					id: string | null;
					organization_id: string | null;
					role: string | null;
					updated_at: string | null;
					user_email: string | null;
					user_id: string | null;
				};
				Relationships: [
					{
						foreignKeyName: 'organization_members_organization_id_fkey';
						columns: ['organization_id'];
						isOneToOne: false;
						referencedRelation: 'organizations';
						referencedColumns: ['id'];
					},
				];
			};
		};
		Functions: {
			accept_interview_invitation: {
				Args: {
					p_invitation_id: string;
					p_candidate_id: string;
				};
				Returns: undefined;
			};
			append_interview_message: {
				Args: {
					p_interview_id: string;
					p_message: Json;
				};
				Returns: Json;
			};
			get_auth_uid: {
				Args: Record<PropertyKey, never>;
				Returns: string;
			};
			is_admin_of: {
				Args: {
					_user_id: string;
					_organization_id: string;
				};
				Returns: boolean;
			};
			is_interviewer_for_interview: {
				Args: {
					interview_id: string;
				};
				Returns: boolean;
			};
			is_member_of: {
				Args: {
					_user_id: string;
					_organization_id: string;
				};
				Returns: boolean;
			};
			is_org_member_with_role: {
				Args: {
					org_id: string;
					required_role: string;
				};
				Returns: boolean;
			};
			is_owner_or_admin_of: {
				Args: {
					_user_id: string;
					_organization_id: string;
				};
				Returns: boolean;
			};
			reschedule_interview_invitation: {
				Args: {
					p_invitation_id: string;
					p_candidate_id: string;
					p_start_at: string;
				};
				Returns: undefined;
			};
		};
		Enums: {
			interview_status: 'ready' | 'scheduled' | 'canceled' | 'confirmed' | 'done';
			invitation_status: 'pending' | 'accepted' | 'declined';
			user_role: 'admin' | 'interviewer' | 'candidate';
		};
		CompositeTypes: {
			[_ in never]: never;
		};
	};
};

type PublicSchema = Database[Extract<keyof Database, 'public'>];

export type Tables<
	PublicTableNameOrOptions extends keyof (PublicSchema['Tables'] & PublicSchema['Views']) | { schema: keyof Database },
	TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
		? keyof (Database[PublicTableNameOrOptions['schema']]['Tables'] &
				Database[PublicTableNameOrOptions['schema']]['Views'])
		: never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
	? (Database[PublicTableNameOrOptions['schema']]['Tables'] &
			Database[PublicTableNameOrOptions['schema']]['Views'])[TableName] extends {
			Row: infer R;
		}
		? R
		: never
	: PublicTableNameOrOptions extends keyof (PublicSchema['Tables'] & PublicSchema['Views'])
		? (PublicSchema['Tables'] & PublicSchema['Views'])[PublicTableNameOrOptions] extends {
				Row: infer R;
			}
			? R
			: never
		: never;

export type TablesInsert<
	PublicTableNameOrOptions extends keyof PublicSchema['Tables'] | { schema: keyof Database },
	TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
		? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
		: never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
	? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
			Insert: infer I;
		}
		? I
		: never
	: PublicTableNameOrOptions extends keyof PublicSchema['Tables']
		? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
				Insert: infer I;
			}
			? I
			: never
		: never;

export type TablesUpdate<
	PublicTableNameOrOptions extends keyof PublicSchema['Tables'] | { schema: keyof Database },
	TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
		? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
		: never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
	? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
			Update: infer U;
		}
		? U
		: never
	: PublicTableNameOrOptions extends keyof PublicSchema['Tables']
		? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
				Update: infer U;
			}
			? U
			: never
		: never;

export type Enums<
	PublicEnumNameOrOptions extends keyof PublicSchema['Enums'] | { schema: keyof Database },
	EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
		? keyof Database[PublicEnumNameOrOptions['schema']]['Enums']
		: never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
	? Database[PublicEnumNameOrOptions['schema']]['Enums'][EnumName]
	: PublicEnumNameOrOptions extends keyof PublicSchema['Enums']
		? PublicSchema['Enums'][PublicEnumNameOrOptions]
		: never;

export type CompositeTypes<
	PublicCompositeTypeNameOrOptions extends keyof PublicSchema['CompositeTypes'] | { schema: keyof Database },
	CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
		schema: keyof Database;
	}
		? keyof Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
		: never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
	? Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
	: PublicCompositeTypeNameOrOptions extends keyof PublicSchema['CompositeTypes']
		? PublicSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
		: never;
