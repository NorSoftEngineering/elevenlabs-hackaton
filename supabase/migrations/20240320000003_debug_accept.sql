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
    raise exception 'Interview invitation not found or not authorized. Invitation ID: %, Candidate ID: %', p_invitation_id, p_candidate_id;
  end if;

  -- Debug log
  raise notice 'Found invitation: %. Interview ID: %', v_invitation.id, v_invitation.interview_id;

  begin
    -- Insert into interviews_candidates if not exists
    insert into interviews_candidates (interview_id, candidate_id)
    values (v_invitation.interview_id, p_candidate_id);
  exception when others then
    raise exception 'Failed to insert into interviews_candidates: %. Interview ID: %, Candidate ID: %', SQLERRM, v_invitation.interview_id, p_candidate_id;
  end;

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
end;
$$ language plpgsql security definer; 