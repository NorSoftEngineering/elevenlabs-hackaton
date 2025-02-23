-- Create a view for interview details with organization info
create view interview_details as
select 
  i.*,
  o.name as organization_name
from interviews i
join organizations o on i.organization_id = o.id;

-- Create a view for candidate invitations with interview details
create view candidate_invitations as
select 
  ii.*,
  i.name as interview_name,
  i.description as interview_description,
  i.duration as interview_duration,
  i.start_at as interview_start_at,
  i.status as interview_status,
  o.name as organization_name
from interviews_invitations ii
join interviews i on ii.interview_id = i.id
join organizations o on i.organization_id = o.id;

-- Create a view for candidate accepted interviews
create view candidate_interviews as
select 
  ic.*,
  i.name as interview_name,
  i.description as interview_description,
  i.duration as interview_duration,
  i.start_at as interview_start_at,
  i.status as interview_status,
  o.name as organization_name
from interviews_candidates ic
join interviews i on ic.interview_id = i.id
join organizations o on i.organization_id = o.id;

-- Add RLS policies for the views
alter view interview_details enable row level security;
alter view candidate_invitations enable row level security;
alter view candidate_interviews enable row level security;

-- RLS policies for interview_details
create policy "Users can view interview details if they are a member of the organization or a candidate"
  on interview_details for select
  using (
    exists (
      select 1 from organization_members
      where organization_id = interview_details.organization_id
      and user_id = auth.uid()
    ) or
    exists (
      select 1 from interviews_candidates
      where interview_id = interview_details.id
      and candidate_id = auth.uid()
    ) or
    exists (
      select 1 from interviews_invitations
      where interview_id = interview_details.id
      and email = auth.email()
    )
  );

-- RLS policies for candidate_invitations
create policy "Users can view their own invitations"
  on candidate_invitations for select
  using (email = auth.email());

-- RLS policies for candidate_interviews
create policy "Users can view their own interviews"
  on candidate_interviews for select
  using (candidate_id = auth.uid()); 