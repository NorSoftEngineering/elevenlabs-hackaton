-- Drop the existing constraint if it exists
alter table interviews_candidates drop constraint if exists interviews_candidates_interview_id_candidate_id_key;

-- Recreate the table structure if needed
create table if not exists interviews_candidates (
  id uuid primary key default uuid_generate_v4(),
  interview_id uuid not null references interviews(id) on delete cascade,
  candidate_id uuid not null references profiles(id),
  created_at timestamptz not null default now(),
  unique(interview_id, candidate_id)
);

-- Add indexes for performance
create index if not exists idx_interviews_candidates_interview_id on interviews_candidates(interview_id);
create index if not exists idx_interviews_candidates_candidate_id on interviews_candidates(candidate_id); 