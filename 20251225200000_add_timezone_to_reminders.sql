-- Add timezone column to reminders table
-- Run this in Supabase SQL Editor

-- Check if column exists, if not add it
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'reminders' 
    AND column_name = 'timezone'
  ) THEN
    ALTER TABLE public.reminders 
    ADD COLUMN timezone TEXT DEFAULT 'UTC';
  END IF;
END $$;

-- Update existing reminders to have UTC timezone if they don't have one
UPDATE public.reminders 
SET timezone = 'UTC' 
WHERE timezone IS NULL;

