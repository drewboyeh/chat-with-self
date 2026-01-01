-- Fix schema cache issue for reminders table
-- Run this in Supabase SQL Editor

-- First, verify the table exists
SELECT table_name, table_schema 
FROM information_schema.tables 
WHERE table_name = 'reminders' AND table_schema = 'public';

-- If the above shows the table, then refresh the schema cache
-- Method 1: Try to reload schema via notification
NOTIFY pgrst, 'reload schema';

-- Method 2: If that doesn't work, we can try to query the table to force cache refresh
SELECT COUNT(*) FROM public.reminders;

-- Method 3: Grant explicit permissions (sometimes helps)
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.reminders TO anon, authenticated;

-- Verify RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'reminders';


