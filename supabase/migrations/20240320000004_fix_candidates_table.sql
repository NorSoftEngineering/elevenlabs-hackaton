-- Drop the table and recreate it
drop table if exists interviews_candidates cascade;

create table interviews_candidates (
  id uuid primary key default uuid_generate_v4(),
  interview_id uuid not null references interviews(id) on delete cascade,
  candidate_id uuid not null references profiles(id),
  created_at timestamptz not null default now()
);

-- Add the unique constraint with a specific name
alter table interviews_candidates 
  add constraint interviews_candidates_interview_candidate_unique 
  unique (interview_id, candidate_id);

-- Add indexes for performance
create index idx_interviews_candidates_interview_id on interviews_candidates(interview_id);
create index idx_interviews_candidates_candidate_id on interviews_candidates(candidate_id); 