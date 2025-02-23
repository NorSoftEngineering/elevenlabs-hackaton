create or replace function accept_interview_invitation(p_invitation_id uuid, p_candidate_id uuid)
returns void
language plpgsql
security definer
as $$
declare
  v_interview_id uuid;
begin
  -- Get the interview_id and verify the invitation exists and is pending
  select interview_id into v_interview_id
  from interviews_invitations
  where id = p_invitation_id and status = 'pending'
  for update;

  if not found then
    raise exception 'Invalid or already processed invitation';
  end if;

  -- Update the invitation status
  update interviews_invitations
  set status = 'accepted',
      responded_at = now()
  where id = p_invitation_id;

  -- Create the interviews_candidates entry
  insert into interviews_candidates (interview_id, candidate_id)
  values (v_interview_id, p_candidate_id);
end;
$$; 