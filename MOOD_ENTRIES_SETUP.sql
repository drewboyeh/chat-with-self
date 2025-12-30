-- Mood Entries Table Setup
-- Run this in your Supabase SQL Editor if mood logging isn't working

-- Create mood entries table for tracking daily emotions
CREATE TABLE IF NOT EXISTS public.mood_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  mood TEXT NOT NULL, -- emoji representation
  mood_score INTEGER NOT NULL CHECK (mood_score >= 1 AND mood_score <= 5),
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.mood_entries ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their own moods" ON public.mood_entries;
DROP POLICY IF EXISTS "Users can create their own moods" ON public.mood_entries;
DROP POLICY IF EXISTS "Users can update their own moods" ON public.mood_entries;
DROP POLICY IF EXISTS "Users can delete their own moods" ON public.mood_entries;

-- RLS policies for mood_entries
CREATE POLICY "Users can view their own moods" 
ON public.mood_entries FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own moods" 
ON public.mood_entries FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own moods" 
ON public.mood_entries FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own moods" 
ON public.mood_entries FOR DELETE 
USING (auth.uid() = user_id);

-- Create index for efficient queries
CREATE INDEX IF NOT EXISTS idx_mood_entries_user_date ON public.mood_entries(user_id, created_at DESC);

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';

