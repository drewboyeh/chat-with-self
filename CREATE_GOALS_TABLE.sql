-- Create goals table (run this BEFORE GOAL_ART_SYSTEM_SETUP.sql)
-- Run this in your Supabase SQL Editor

-- Create goals table for tracking user goals
CREATE TABLE IF NOT EXISTS public.goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'personal', -- personal, health, career, relationships, growth
  status TEXT NOT NULL DEFAULT 'active', -- active, completed, paused
  target_date DATE,
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

-- RLS policies for goals
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'goals' 
    AND policyname = 'Users can view their own goals'
  ) THEN
    CREATE POLICY "Users can view their own goals" 
    ON public.goals FOR SELECT 
    USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'goals' 
    AND policyname = 'Users can create their own goals'
  ) THEN
    CREATE POLICY "Users can create their own goals" 
    ON public.goals FOR INSERT 
    WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'goals' 
    AND policyname = 'Users can update their own goals'
  ) THEN
    CREATE POLICY "Users can update their own goals" 
    ON public.goals FOR UPDATE 
    USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'goals' 
    AND policyname = 'Users can delete their own goals'
  ) THEN
    CREATE POLICY "Users can delete their own goals" 
    ON public.goals FOR DELETE 
    USING (auth.uid() = user_id);
  END IF;
END $$;

-- Create index for goals
CREATE INDEX IF NOT EXISTS idx_goals_user_status ON public.goals(user_id, status);

-- Create trigger for automatic timestamp updates on goals
CREATE OR REPLACE FUNCTION update_goals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_goals_updated_at ON public.goals;
CREATE TRIGGER update_goals_updated_at
BEFORE UPDATE ON public.goals
FOR EACH ROW
EXECUTE FUNCTION update_goals_updated_at();

