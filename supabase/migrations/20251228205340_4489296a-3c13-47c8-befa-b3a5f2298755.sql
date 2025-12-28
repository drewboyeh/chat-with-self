-- Enable RLS on verification_codes table (may already be enabled but ensuring)
ALTER TABLE public.verification_codes ENABLE ROW LEVEL SECURITY;

-- Block all public access - only service role can access this table
-- This ensures only Edge Functions with service role key can read/write verification codes
CREATE POLICY "Block all public access to verification codes"
ON public.verification_codes
FOR ALL
USING (false)
WITH CHECK (false);