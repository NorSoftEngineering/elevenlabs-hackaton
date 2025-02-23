-- Create interview related enums
CREATE TYPE interview_status AS ENUM (
  'ready',      -- Initial state, interview is created but not yet scheduled
  'scheduled',  -- Interview has a confirmed date/time
  'canceled',   -- Interview was canceled
  'confirmed',  -- All participants confirmed attendance
  'done'        -- Interview is completed
);

CREATE TYPE invitation_status AS ENUM (
  'pending',    -- Initial state
  'accepted',   -- Candidate accepted the invitation
  'declined'    -- Candidate declined the invitation
);

-- Create interviews table
CREATE TABLE interviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  duration INTERVAL NOT NULL DEFAULT '1 hour'::INTERVAL,
  start_at TIMESTAMPTZ CHECK (start_at > NOW()),
  status interview_status NOT NULL DEFAULT 'ready',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create interviews_candidates table (for accepted candidates)
CREATE TABLE interviews_candidates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  interview_id UUID NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(interview_id, candidate_id)
);

-- Create interviews_invitations table
CREATE TABLE interviews_invitations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  interview_id UUID NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  status invitation_status NOT NULL DEFAULT 'pending',
  invited_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  responded_at TIMESTAMPTZ,
  UNIQUE(interview_id, email)
);

-- Create interviews_interviewers table
CREATE TABLE interviews_interviewers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  interview_id UUID NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,
  interviewer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(interview_id, interviewer_id)
);

-- Add triggers for updated_at
CREATE TRIGGER update_interviews_updated_at
  BEFORE UPDATE ON interviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_interviews_candidates_updated_at
  BEFORE UPDATE ON interviews_candidates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_interviews_invitations_updated_at
  BEFORE UPDATE ON interviews_invitations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_interviews_interviewers_updated_at
  BEFORE UPDATE ON interviews_interviewers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to handle invitation acceptance
CREATE OR REPLACE FUNCTION handle_invitation_acceptance()
RETURNS TRIGGER AS $$
BEGIN
  -- If invitation is accepted, create a candidate entry
  IF NEW.status = 'accepted' AND OLD.status = 'pending' THEN
    INSERT INTO interviews_candidates (interview_id, candidate_id)
    SELECT NEW.interview_id, profiles.id
    FROM profiles
    WHERE profiles.email = NEW.email;
  END IF;
  
  -- Set responded_at timestamp
  IF NEW.status != OLD.status THEN
    NEW.responded_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for handling invitation responses
CREATE TRIGGER on_invitation_response
  BEFORE UPDATE ON interviews_invitations
  FOR EACH ROW
  WHEN (OLD.status = 'pending' AND NEW.status != 'pending')
  EXECUTE FUNCTION handle_invitation_acceptance();

-- Enable RLS
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE interviews_candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE interviews_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE interviews_interviewers ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is org member with specific role
CREATE OR REPLACE FUNCTION is_org_member_with_role(org_id UUID, required_role TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM organization_members
    WHERE organization_id = org_id
    AND user_id = auth.uid()
    AND role = required_role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is interviewer for interview
CREATE OR REPLACE FUNCTION is_interviewer_for_interview(interview_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM interviews_interviewers
    WHERE interview_id = interview_id
    AND interviewer_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Interviews policies
CREATE POLICY "Organization members can view interviews"
  ON interviews FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM organization_members
    WHERE organization_id = interviews.organization_id
    AND user_id = auth.uid()
  ));

CREATE POLICY "Only admins and owners can create interviews"
  ON interviews FOR INSERT
  WITH CHECK (
    is_org_member_with_role(organization_id, 'owner') OR
    is_org_member_with_role(organization_id, 'admin')
  );

CREATE POLICY "Only admins and owners can update interviews"
  ON interviews FOR UPDATE
  USING (
    is_org_member_with_role(organization_id, 'owner') OR
    is_org_member_with_role(organization_id, 'admin')
  );

CREATE POLICY "Only admins and owners can delete interviews"
  ON interviews FOR DELETE
  USING (
    is_org_member_with_role(organization_id, 'owner') OR
    is_org_member_with_role(organization_id, 'admin')
  );

-- Interviews candidates policies
CREATE POLICY "Organization members can view candidates"
  ON interviews_candidates FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM interviews i
    JOIN organization_members om ON i.organization_id = om.organization_id
    WHERE i.id = interviews_candidates.interview_id
    AND om.user_id = auth.uid()
  ));

CREATE POLICY "Only admins and owners can manage candidates"
  ON interviews_candidates FOR ALL
  USING (EXISTS (
    SELECT 1 FROM interviews i
    JOIN organization_members om ON i.organization_id = om.organization_id
    WHERE i.id = interviews_candidates.interview_id
    AND om.user_id = auth.uid()
    AND om.role IN ('owner', 'admin')
  ));

-- Interviews invitations policies
CREATE POLICY "Organization members can view invitations"
  ON interviews_invitations FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM interviews i
    JOIN organization_members om ON i.organization_id = om.organization_id
    WHERE i.id = interviews_invitations.interview_id
    AND om.user_id = auth.uid()
  ));

CREATE POLICY "Only admins and owners can create invitations"
  ON interviews_invitations FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM interviews i
    JOIN organization_members om ON i.organization_id = om.organization_id
    WHERE i.id = interviews_invitations.interview_id
    AND om.user_id = auth.uid()
    AND om.role IN ('owner', 'admin')
  ));

CREATE POLICY "Invitee can update their own invitation"
  ON interviews_invitations FOR UPDATE
  USING (
    auth.email() = email
  );

CREATE POLICY "Only admins and owners can delete invitations"
  ON interviews_invitations FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM interviews i
    JOIN organization_members om ON i.organization_id = om.organization_id
    WHERE i.id = interviews_invitations.interview_id
    AND om.user_id = auth.uid()
    AND om.role IN ('owner', 'admin')
  ));

-- Interviews interviewers policies
CREATE POLICY "Organization members can view interviewers"
  ON interviews_interviewers FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM interviews i
    JOIN organization_members om ON i.organization_id = om.organization_id
    WHERE i.id = interviews_interviewers.interview_id
    AND om.user_id = auth.uid()
  ));

CREATE POLICY "Only admins and owners can manage interviewers"
  ON interviews_interviewers FOR ALL
  USING (EXISTS (
    SELECT 1 FROM interviews i
    JOIN organization_members om ON i.organization_id = om.organization_id
    WHERE i.id = interviews_interviewers.interview_id
    AND om.user_id = auth.uid()
    AND om.role IN ('owner', 'admin')
  )); 