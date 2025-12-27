-- Security: ensure verification_codes is not accessible from the client
ALTER TABLE public.verification_codes ENABLE ROW LEVEL SECURITY;

-- Intentionally no RLS policies: only the service role (used by backend functions) can access it.