create or replace function accept_interview_invitation(
  p_invitation_id uuid,
  p_candidate_id uuid
) returns void as $$
declare
  v_interview_id uuid;
  v_invitation interviews_invitations%rowtype;
begin
  -- Set transaction isolation level to serializable to prevent race conditions
  set transaction isolation level serializable;

  -- Lock the invitation row for update to prevent concurrent modifications
  select * into v_invitation
  from interviews_invitations
  where id = p_invitation_id
    and status = 'pending'
    and exists (
      select 1 from profiles
      where id = p_candidate_id
      and email = interviews_invitations.email
    )
  for update;

  if v_invitation is null then
    raise exception 'Interview invitation not found or not authorized. Invitation ID: %, Candidate ID: %', p_invitation_id, p_candidate_id;
  end if;

  -- Check if candidate is already added
  if exists (
    select 1 from interviews_candidates
    where interview_id = v_invitation.interview_id
    and candidate_id = p_candidate_id
    for update
  ) then
    -- Just update the invitation status if already accepted
    update interviews_invitations
    set status = 'accepted',
        responded_at = now(),
        updated_at = now()
    where id = p_invitation_id;
    return;
  end if;

  -- Insert into interviews_candidates
  insert into interviews_candidates (interview_id, candidate_id)
  values (v_invitation.interview_id, p_candidate_id);

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

exception when serialization_failure then
  -- If we hit a serialization error, retry the transaction
  raise exception 'Transaction failed due to concurrent modification. Please try again.';
end;
$$ language plpgsql security definer; 