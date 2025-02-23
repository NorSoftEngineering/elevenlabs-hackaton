-- Drop the existing view
drop view if exists candidate_interviews;

-- Recreate the view with candidate email
create or replace view candidate_interviews as
select 
  ic.id,
  ic.interview_id,
  ic.candidate_id,
  ic.created_at,
  i.name as interview_name,
  i.description as interview_description,
  i.duration as interview_duration,
  i.start_at as interview_start_at,
  i.status as interview_status,
  o.name as organization_name,
  p.email as candidate_email
from interviews_candidates ic
join interviews i on i.id = ic.interview_id
join organizations o on o.id = i.organization_id
join profiles p on p.id = ic.candidate_id; 