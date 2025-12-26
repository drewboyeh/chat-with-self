-- Create verification_codes table for phone verification
CREATE TABLE public.verification_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phone TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  verified BOOLEAN NOT NULL DEFAULT false
);

-- Create indexes for faster lookups
CREATE INDEX idx_verification_codes_phone ON public.verification_codes(phone);
CREATE INDEX idx_verification_codes_expires_at ON public.verification_codes(expires_at);

-- RLS is not needed as this table is only accessed via edge functions with service role key