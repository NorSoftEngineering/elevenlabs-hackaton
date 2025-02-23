create or replace function accept_interview_invitation(
  p_invitation_id uuid,
  p_candidate_id uuid
) returns void as $$
begin
  -- Start transaction and set isolation level
  begin;
  set transaction isolation level serializable;

  with invitation as (
    -- Lock the invitation row for update to prevent concurrent modifications
    select i.* 
    from interviews_invitations i
    where i.id = p_invitation_id
      and i.status = 'pending'
      and exists (
        select 1 from profiles
        where id = p_candidate_id
        and email = i.email
      )
    for update
  ),
  candidate_check as (
    -- Check if candidate is already added
    select 1 
    from interviews_candidates ic
    where ic.interview_id = (select interview_id from invitation)
    and ic.candidate_id = p_candidate_id
    for update
  ),
  insert_candidate as (
    -- Insert into interviews_candidates if not exists
    insert into interviews_candidates (interview_id, candidate_id)
    select interview_id, p_candidate_id
    from invitation
    where not exists (select 1 from candidate_check)
    returning id
  ),
  update_invitation as (
    -- Update the invitation status
    update interviews_invitations
    set status = 'accepted',
        responded_at = now(),
        updated_at = now()
    where id = p_invitation_id
    returning interview_id
  )
  -- Insert an acceptance event
  insert into interview_events (
    interview_id,
    event_type,
    actor_id,
    metadata,
    created_at
  )
  select 
    i.interview_id,
    'invitation_accepted',
    p_candidate_id,
    jsonb_build_object(
      'invitation_id', p_invitation_id
    ),
    now()
  from invitation i
  where exists (select 1 from update_invitation);

  -- If we got here without finding the invitation, raise an error
  if not exists (select 1 from interviews_invitations where id = p_invitation_id) then
    raise exception 'Interview invitation not found or not authorized. Invitation ID: %, Candidate ID: %', p_invitation_id, p_candidate_id;
  end if;

  -- Commit the transaction
  commit;

exception 
  when serialization_failure then
    -- If we hit a serialization error, rollback and retry
    rollback;
    raise exception 'Transaction failed due to concurrent modification. Please try again.';
  when others then
    -- Re-raise any other errors after rollback
    rollback;
    raise;
end;
$$ language plpgsql security definer; 