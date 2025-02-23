-- Drop the existing table
drop table if exists interviews_candidates cascade;

-- Recreate the table
create table interviews_candidates (
  id uuid primary key default uuid_generate_v4(),
  interview_id uuid not null references interviews(id) on delete cascade,
  candidate_id uuid not null references profiles(id),
  created_at timestamptz not null default now()
);

-- Add the unique constraint
alter table interviews_candidates 
  add constraint interviews_candidates_interview_candidate_unique 
  unique (interview_id, candidate_id);

-- Add indexes for performance
create index idx_interviews_candidates_interview_id on interviews_candidates(interview_id);
create index idx_interviews_candidates_candidate_id on interviews_candidates(candidate_id);

-- Recreate the accept function with better error handling
create or replace function accept_interview_invitation(
  p_invitation_id uuid,
  p_candidate_id uuid
) returns void as $$
declare
  v_invitation interviews_invitations%rowtype;
  v_exists boolean;
begin
  -- Lock the invitation row for update to prevent concurrent modifications
  select i.* into v_invitation
  from interviews_invitations i
  where i.id = p_invitation_id
    and i.status = 'pending'
    and exists (
      select 1 from profiles
      where id = p_candidate_id
      and email = i.email
    )
  for update;

  if v_invitation is null then
    raise exception 'Interview invitation not found or not authorized. Invitation ID: %, Candidate ID: %', p_invitation_id, p_candidate_id;
  end if;

  -- Check if the candidate is already added
  select exists(
    select 1 
    from interviews_candidates 
    where interview_id = v_invitation.interview_id 
    and candidate_id = p_candidate_id
  ) into v_exists;

  -- If not already added, insert them
  if not v_exists then
    insert into interviews_candidates (interview_id, candidate_id)
    values (v_invitation.interview_id, p_candidate_id);
  end if;

  -- Update the invitation status
  update interviews_invitations
  set status = 'accepted',
      responded_at = now(),
      updated_at = now()
  where id = p_invitation_id;

  -- Insert an acceptance event
  insert into interview_events (
    interview_id,
    event_type,
    actor_id,
    metadata,
    created_at
  ) values (
    v_invitation.interview_id,
    'invitation_accepted',
    p_candidate_id,
    jsonb_build_object(
      'invitation_id', p_invitation_id
    ),
    now()
  );

exception 
  when unique_violation then
    -- If we somehow hit a race condition, just update the invitation
    update interviews_invitations
    set status = 'accepted',
        responded_at = now(),
        updated_at = now()
    where id = p_invitation_id;
  when others then
    raise;
end;
$$ language plpgsql security definer; 