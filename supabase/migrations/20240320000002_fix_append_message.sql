-- Drop the function if it exists (to avoid conflicts)
DROP FUNCTION IF EXISTS public.append_interview_message;

-- Create the function with exact parameter names that match the RPC call
CREATE OR REPLACE FUNCTION public.append_interview_message(
    p_interview_id uuid,
    p_message jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    updated_messages jsonb;
BEGIN
    -- Update the messages array and return the new array
    UPDATE public.interviews
    SET messages = COALESCE(messages, '[]'::jsonb) || p_message
    WHERE id = p_interview_id
    RETURNING messages INTO updated_messages;
    
    RETURN updated_messages;
END;
$$; 