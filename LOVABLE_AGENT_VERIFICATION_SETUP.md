# Lovable Agent Instructions: Phone Verification Setup

## The Problem
The Twilio phone verification needs a database table to store verification codes. Currently, codes are stored in-memory which doesn't work because Supabase Edge Functions can't share memory.

## The Solution
Run this SQL to create the `verification_codes` table.

## Instructions for Lovable Agent

**Copy and paste this to Lovable's agent:**

```
Please run this SQL in the Supabase SQL Editor to create the verification_codes table for phone verification:

CREATE TABLE IF NOT EXISTS public.verification_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phone TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  verified BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_verification_codes_phone ON public.verification_codes(phone);
CREATE INDEX IF NOT EXISTS idx_verification_codes_expires_at ON public.verification_codes(expires_at);

CREATE OR REPLACE FUNCTION cleanup_expired_codes()
RETURNS void AS $$
BEGIN
  DELETE FROM public.verification_codes
  WHERE expires_at < now() OR verified = true;
END;
$$ LANGUAGE plpgsql;
```

## What This Does

1. Creates `verification_codes` table to store:
   - Phone number
   - 6-digit verification code
   - Expiry time (10 minutes)
   - Whether it's been verified

2. Creates indexes for fast lookups by phone number

3. Creates cleanup function to remove expired codes

## After Running

1. The phone verification should work correctly
2. Codes will be stored in the database
3. Both `send-verification-code` and `verify-code` functions can access the same codes

## Also Needed: Twilio Environment Variables

Make sure these are set in Lovable's environment variables:
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_PHONE_NUMBER`

And in Supabase Edge Functions secrets:
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_PHONE_NUMBER`

