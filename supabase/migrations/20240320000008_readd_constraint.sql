-- First remove any duplicates
delete from interviews_candidates a using interviews_candidates b
where a.id > b.id 
and a.interview_id = b.interview_id 
and a.candidate_id = b.candidate_id;

-- Add back the unique constraint
alter table interviews_candidates 
  add constraint interviews_candidates_interview_candidate_unique 
  unique (interview_id, candidate_id); 