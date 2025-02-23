create or replace function accept_interview_invitation(
  p_invitation_id uuid,
  p_candidate_id uuid
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

  -- Insert into interviews_candidates if not exists
  insert into interviews_candidates (interview_id, candidate_id)
  values (v_invitation.interview_id, p_candidate_id)
  on conflict (interview_id, candidate_id) do nothing;

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

  -- Could add notification logic here
end;
$$ language plpgsql security definer; 