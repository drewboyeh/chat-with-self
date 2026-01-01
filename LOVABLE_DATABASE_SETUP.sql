-- Complete database setup for reminders feature
-- Give this to Lovable's agent to run in the Supabase SQL Editor

-- Step 1: Create reminders table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  task TEXT NOT NULL,
  reminder_time TIMESTAMP WITH TIME ZONE NOT NULL,
  recurrence TEXT DEFAULT 'none',
  is_active BOOLEAN NOT NULL DEFAULT true,
  completed_at TIMESTAMP WITH TIME ZONE,
  last_notified_at TIMESTAMP WITH TIME ZONE,
  timezone TEXT DEFAULT 'UTC',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Step 2: Enable Row Level Security
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;

-- Step 3: Create RLS policies (only if they don't exist)
DO $$ 
BEGIN
  -- Policy for SELECT
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'reminders' 
    AND policyname = 'Users can view their own reminders'
  ) THEN
    CREATE POLICY "Users can view their own reminders" 
    ON public.reminders FOR SELECT 
    USING (auth.uid() = user_id);
  END IF;

  -- Policy for INSERT
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'reminders' 
    AND policyname = 'Users can create their own reminders'
  ) THEN
    CREATE POLICY "Users can create their own reminders" 
    ON public.reminders FOR INSERT 
    WITH CHECK (auth.uid() = user_id);
  END IF;

  -- Policy for UPDATE
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'reminders' 
    AND policyname = 'Users can update their own reminders'
  ) THEN
    CREATE POLICY "Users can update their own reminders" 
    ON public.reminders FOR UPDATE 
    USING (auth.uid() = user_id);
  END IF;

  -- Policy for DELETE
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'reminders' 
    AND policyname = 'Users can delete their own reminders'
  ) THEN
    CREATE POLICY "Users can delete their own reminders" 
    ON public.reminders FOR DELETE 
    USING (auth.uid() = user_id);
  END IF;
END $$;

-- Step 4: Add timezone column if it doesn't exist (for existing tables)
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
  END IF;
END $$;

-- Verify: Check if table was created successfully
SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'reminders'
ORDER BY ordinal_position;


