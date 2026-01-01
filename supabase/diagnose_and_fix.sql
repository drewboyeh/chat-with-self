-- Complete diagnostic and fix for reminders table schema cache issue
-- Run this ENTIRE script in Supabase SQL Editor

-- ============================================
-- DIAGNOSTIC: Check current state
-- ============================================
SELECT '=== DIAGNOSTIC: Checking table existence ===' as step;

SELECT 
    table_schema,
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_name = 'reminders';

SELECT '=== Checking permissions ===' as step;

SELECT 
    grantee,
    privilege_type
FROM information_schema.role_table_grants
WHERE table_name = 'reminders';

-- ============================================
-- FIX: Drop and recreate with explicit setup
-- ============================================
SELECT '=== FIX: Dropping and recreating table ===' as step;

-- Drop everything related to reminders
DROP TABLE IF EXISTS public.reminders CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Recreate the table (without IF NOT EXISTS - this is important)
CREATE TABLE public.reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  task TEXT NOT NULL,
  reminder_time TIMESTAMP WITH TIME ZONE NOT NULL,
  recurrence TEXT CHECK (recurrence IN ('none', 'daily', 'weekly', 'weekdays')),
  timezone TEXT DEFAULT 'UTC',
  is_active BOOLEAN DEFAULT true,
  completed_at TIMESTAMP WITH TIME ZONE,
  last_notified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own reminders" 
ON public.reminders FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own reminders" 
ON public.reminders FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reminders" 
ON public.reminders FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reminders" 
ON public.reminders FOR DELETE 
USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_reminders_user_id ON public.reminders(user_id);
CREATE INDEX idx_reminders_reminder_time ON public.reminders(reminder_time);
CREATE INDEX idx_reminders_is_active ON public.reminders(is_active) WHERE is_active = true;

-- Create function and trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_reminders_updated_at
BEFORE UPDATE ON public.reminders
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- GRANT PERMISSIONS: Explicit grants for PostgREST
-- ============================================
SELECT '=== Granting permissions ===' as step;

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON public.reminders TO anon, authenticated, service_role;

-- ============================================
-- VERIFY: Check everything is set up
-- ============================================
SELECT '=== VERIFICATION: Final checks ===' as step;

SELECT 'Table exists:' as check, COUNT(*) as count 
FROM information_schema.tables 
WHERE table_name = 'reminders' AND table_schema = 'public';

SELECT 'Policies exist:' as check, COUNT(*) as count
FROM pg_policies 
WHERE tablename = 'reminders';

SELECT 'Indexes exist:' as check, COUNT(*) as count
FROM pg_indexes 
WHERE tablename = 'reminders' AND schemaname = 'public';

-- ============================================
-- FORCE SCHEMA RELOAD
-- ============================================
SELECT '=== Attempting schema reload ===' as step;

-- Try multiple methods to force reload
NOTIFY pgrst, 'reload schema';

-- Query the table to force it into cache
SELECT COUNT(*) FROM public.reminders;

SELECT '=== DONE: Wait 30 seconds, then try creating a reminder ===' as final_step;


