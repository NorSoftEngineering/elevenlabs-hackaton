-- Create interview_events table for tracking interview-related events
create table if not exists interview_events (
  id uuid primary key default uuid_generate_v4(),
  interview_id uuid not null references interviews(id) on delete cascade,
  event_type text not null,
  actor_id uuid not null references profiles(id),
  metadata jsonb default '{}',
  created_at timestamptz not null default now()
);

-- Create index for faster lookups
create index if not exists idx_interview_events_interview_id on interview_events(interview_id);
create index if not exists idx_interview_events_actor_id on interview_events(actor_id);
create index if not exists idx_interview_events_created_at on interview_events(created_at);

-- Function for rescheduling interviews
create or replace function reschedule_interview_invitation(
  p_invitation_id uuid,
  p_candidate_id uuid,
  p_start_at timestamptz
) returns void as $$
declare
  v_interview_id uuid;
  v_invitation interviews_invitations%rowtype;
begin
  -- Get the invitation and verify it belongs to the candidate
  select * into v_invitation
  from interviews_invitations
  where id = p_invitation_id
    and status = 'pending'
    and exists (
      select 1 from profiles
      where id = p_candidate_id
      and email = interviews_invitations.email
    );

  if v_invitation is null then
    raise exception 'Interview invitation not found or not authorized';
  end if;

  -- Update the interview start time
  update interviews
  set start_at = p_start_at,
      status = 'scheduled',
      updated_at = now()
  where id = v_invitation.interview_id;

  -- Update the invitation to track rescheduling
  update interviews_invitations
  set rescheduled_at = now(),
      updated_at = now()
  where id = p_invitation_id;

  -- Insert a rescheduling event for tracking
  insert into interview_events (
    interview_id,
    event_type,
    actor_id,
    metadata,
    created_at
  ) values (
    v_invitation.interview_id,
    'rescheduled',
    p_candidate_id,
    jsonb_build_object(
      'old_start_at', (select start_at from interviews where id = v_invitation.interview_id),
      'new_start_at', p_start_at
    ),
    now()
  );

  -- Could add notification logic here
end;
$$ language plpgsql security definer; 