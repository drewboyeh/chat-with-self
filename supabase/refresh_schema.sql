-- Refresh Supabase schema cache
-- Run this after creating new tables to make them available via the API

-- This will refresh the PostgREST schema cache
NOTIFY pgrst, 'reload schema';

