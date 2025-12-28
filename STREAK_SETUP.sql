-- Streak Counter Database Setup
-- Run this in Lovable's Supabase SQL Editor

-- Create user_streaks table to track journaling streaks
CREATE TABLE IF NOT EXISTS public.user_streaks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_journal_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;

-- Users can view their own streak
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'user_streaks' 
    AND policyname = 'Users can view their own streak'
  ) THEN
    CREATE POLICY "Users can view their own streak" 
    ON public.user_streaks 
    FOR SELECT 
    USING (auth.uid() = user_id);
  END IF;
END $$;

-- Users can insert their own streak
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'user_streaks' 
    AND policyname = 'Users can create their own streak'
  ) THEN
    CREATE POLICY "Users can create their own streak" 
    ON public.user_streaks 
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Users can update their own streak
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'user_streaks' 
    AND policyname = 'Users can update their own streak'
  ) THEN
    CREATE POLICY "Users can update their own streak" 
    ON public.user_streaks 
    FOR UPDATE 
    USING (auth.uid() = user_id);
  END IF;
END $$;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_streaks_user_id ON public.user_streaks(user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_streaks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_user_streaks_updated_at ON public.user_streaks;
CREATE TRIGGER update_user_streaks_updated_at
BEFORE UPDATE ON public.user_streaks
FOR EACH ROW
EXECUTE FUNCTION update_user_streaks_updated_at();

-- Verify table was created
SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'user_streaks'
ORDER BY ordinal_position;

