-- Simple script to add timezone column and refresh schema cache
-- Run this in Lovable's Supabase SQL Editor

-- Step 1: Add timezone column if it doesn't exist
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
    
    -- Update existing rows
    UPDATE public.reminders 
    SET timezone = 'UTC' 
    WHERE timezone IS NULL;
    
    RAISE NOTICE 'Timezone column added successfully';
  ELSE
    RAISE NOTICE 'Timezone column already exists';
  END IF;
END $$;

-- Step 2: Force refresh the schema cache
NOTIFY pgrst, 'reload schema';

-- Step 3: Verify the column exists
SELECT 
  column_name,
  data_type,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'reminders'
  AND column_name = 'timezone';


