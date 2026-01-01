-- Force PostgREST to see the reminders table
-- Run this in Supabase SQL Editor

-- Step 1: Verify table exists and check its structure
SELECT 
    table_schema,
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_name = 'reminders';

-- Step 2: Check if table is in public schema and accessible
SELECT COUNT(*) as reminder_count FROM public.reminders;

-- Step 3: Ensure the table is properly exposed to PostgREST
-- PostgREST needs tables to be in the public schema and have proper permissions

-- Step 4: Try to force a schema reload by querying the API metadata
-- This sometimes helps refresh the cache
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'reminders';

-- Step 5: Grant explicit permissions (sometimes PostgREST needs this)
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.reminders TO postgres, anon, authenticated, service_role;

-- Step 6: Try the NOTIFY command again
NOTIFY pgrst, 'reload schema';

-- Step 7: If still not working, try creating a dummy query to force cache
SELECT * FROM public.reminders WHERE false;


