-- Phone Verification Codes Table Setup
-- Give this to Lovable's agent to run in the Supabase SQL Editor

-- Create verification_codes table for phone verification
CREATE TABLE IF NOT EXISTS public.verification_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phone TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  verified BOOLEAN NOT NULL DEFAULT false
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_verification_codes_phone ON public.verification_codes(phone);
CREATE INDEX IF NOT EXISTS idx_verification_codes_expires_at ON public.verification_codes(expires_at);

-- Optional: Create function to clean up expired codes
CREATE OR REPLACE FUNCTION cleanup_expired_codes()
RETURNS void AS $$
BEGIN
  DELETE FROM public.verification_codes
  WHERE expires_at < now() OR verified = true;
END;
$$ LANGUAGE plpgsql;

-- Verify table was created
SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'verification_codes'
ORDER BY ordinal_position;

