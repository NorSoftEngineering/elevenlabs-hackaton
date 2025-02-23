-- Add token and expiration columns to interviews_invitations
ALTER TABLE interviews_invitations
ADD COLUMN token UUID DEFAULT gen_random_uuid() NOT NULL,
ADD COLUMN expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
ADD CONSTRAINT interviews_invitations_token_key UNIQUE (token);

-- Create index for faster token lookups
CREATE INDEX idx_interviews_invitations_token ON interviews_invitations(token);

-- Function to validate invitation token
CREATE OR REPLACE FUNCTION validate_invitation_token(p_token UUID)
RETURNS TABLE (
  invitation_id UUID,
  interview_id UUID,
  email TEXT,
  status invitation_status,
  is_expired BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    i.id as invitation_id,
    i.interview_id,
    i.email,
    i.status,
    i.expires_at < NOW() as is_expired
  FROM interviews_invitations i
  WHERE i.token = p_token
  AND i.status = 'pending'
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 