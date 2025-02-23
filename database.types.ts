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
			interviews: {
				Row: {
					created_at: string;
					description: string | null;
					duration: unknown;
					id: string;
					name: string;
					organization_id: string;
					start_at: string | null;
					status: Database['public']['Enums']['interview_status'];
					updated_at: string;
					messages:
						| {
								id: string;
								message: string;
								source: string;
								timestamp: string;
						  }[]
						| null;
				};
				Insert: {
					created_at?: string;
					description?: string | null;
					duration?: unknown;
					id?: string;
					name: string;
					organization_id: string;
					start_at?: string | null;
					status?: Database['public']['Enums']['interview_status'];
					updated_at?: string;
					messages?:
						| {
								id: string;
								message: string;
								source: string;
								timestamp: string;
						  }[]
						| null;
				};
				Update: {
					created_at?: string;
					description?: string | null;
					duration?: unknown;
					id?: string;
					name?: string;
					organization_id?: string;
					start_at?: string | null;
					status?: Database['public']['Enums']['interview_status'];
					updated_at?: string;
					messages?:
						| {
								id: string;
								message: string;
								source: string;
								timestamp: string;
						  }[]
						| null;
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
						referencedRelation: 'interviews';
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
					responded_at: string | null;
					status: Database['public']['Enums']['invitation_status'];
				};
				Insert: {
					email: string;
					id?: string;
					interview_id: string;
					invited_at?: string;
					responded_at?: string | null;
					status?: Database['public']['Enums']['invitation_status'];
				};
				Update: {
					email?: string;
					id?: string;
					interview_id?: string;
					invited_at?: string;
					responded_at?: string | null;
					status?: Database['public']['Enums']['invitation_status'];
				};
				Relationships: [
					{
						foreignKeyName: 'interviews_invitations_interview_id_fkey';
						columns: ['interview_id'];
						isOneToOne: false;
						referencedRelation: 'interviews';
						referencedColumns: ['id'];
					},
				];
			};
			leads: {
				Row: {
					created_at: string;
					email: string;
					first_name: string | null;
					gender: string | null;
					id: number;
					last_name: string | null;
					phone: string | null;
				};
				Insert: {
					created_at?: string;
					email: string;
					first_name?: string | null;
					gender?: string | null;
					id?: number;
					last_name?: string | null;
					phone?: string | null;
				};
				Update: {
					created_at?: string;
					email?: string;
					first_name?: string | null;
					gender?: string | null;
					id?: number;
					last_name?: string | null;
					phone?: string | null;
				};
				Relationships: [];
			};
			meetings: {
				Row: {
					active: boolean | null;
					created_at: string;
					duration: number | null;
					end_datetime: string | null;
					id: number;
					meeting_id: string;
					meeting_link: string | null;
					start_datetime: string | null;
					status: string | null;
				};
				Insert: {
					active?: boolean | null;
					created_at?: string;
					duration?: number | null;
					end_datetime?: string | null;
					id?: number;
					meeting_id: string;
					meeting_link?: string | null;
					start_datetime?: string | null;
					status?: string | null;
				};
				Update: {
					active?: boolean | null;
					created_at?: string;
					duration?: number | null;
					end_datetime?: string | null;
					id?: number;
					meeting_id?: string;
					meeting_link?: string | null;
					start_datetime?: string | null;
					status?: string | null;
				};
				Relationships: [];
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
			interview_checkpoints: {
				Row: {
					id: string;
					interview_id: string;
					checkpoint_id: number;
					title: string;
					description: string;
					completed_at: string | null;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					interview_id: string;
					checkpoint_id: number;
					title: string;
					description: string;
					completed_at?: string | null;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					id?: string;
					interview_id?: string;
					checkpoint_id?: number;
					title?: string;
					description?: string;
					completed_at?: string | null;
					created_at?: string;
					updated_at?: string;
				};
				Relationships: [
					{
						foreignKeyName: 'interview_checkpoints_interview_id_fkey';
						columns: ['interview_id'];
						isOneToOne: false;
						referencedRelation: 'interviews';
						referencedColumns: ['id'];
					},
				];
			};
			interview_messages: {
				Row: {
					id: string;
					interview_id: string;
					message: string;
					source: string;
					timestamp: string;
					created_at: string;
				};
				Insert: {
					id?: string;
					interview_id: string;
					message: string;
					source: string;
					timestamp: string;
					created_at?: string;
				};
				Update: {
					id?: string;
					interview_id?: string;
					message?: string;
					source?: string;
					timestamp?: string;
					created_at?: string;
				};
				Relationships: [
					{
						foreignKeyName: 'interview_messages_interview_id_fkey';
						columns: ['interview_id'];
						isOneToOne: false;
						referencedRelation: 'interviews';
						referencedColumns: ['id'];
					},
				];
			};
		};
		Views: {
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
		};
		Enums: {
			interview_status: 'ready' | 'scheduled' | 'canceled' | 'confirmed' | 'done' | 'paused';
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
