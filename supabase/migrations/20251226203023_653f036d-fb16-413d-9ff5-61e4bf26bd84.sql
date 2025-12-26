-- Create mood entries table for tracking daily emotions
CREATE TABLE public.mood_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  mood TEXT NOT NULL, -- emoji representation
  mood_score INTEGER NOT NULL CHECK (mood_score >= 1 AND mood_score <= 5),
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.mood_entries ENABLE ROW LEVEL SECURITY;

-- RLS policies for mood_entries
CREATE POLICY "Users can view their own moods" 
ON public.mood_entries FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own moods" 
ON public.mood_entries FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own moods" 
ON public.mood_entries FOR DELETE 
USING (auth.uid() = user_id);

-- Create index for efficient queries
CREATE INDEX idx_mood_entries_user_date ON public.mood_entries(user_id, created_at DESC);

-- Create goals table for tracking user goals
CREATE TABLE public.goals (
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
CREATE POLICY "Users can view their own goals" 
ON public.goals FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own goals" 
ON public.goals FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goals" 
ON public.goals FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own goals" 
ON public.goals FOR DELETE 
USING (auth.uid() = user_id);

-- Create index for goals
CREATE INDEX idx_goals_user_status ON public.goals(user_id, status);

-- Create trigger for automatic timestamp updates on goals
CREATE TRIGGER update_goals_updated_at
BEFORE UPDATE ON public.goals
FOR EACH ROW
EXECUTE FUNCTION public.update_user_streaks_updated_at();

-- Create prompt_responses table to track which prompts users have answered
CREATE TABLE public.prompt_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  prompt_category TEXT NOT NULL, -- gratitude, mindfulness, cbt, goal_reflection
  prompt_text TEXT NOT NULL,
  response TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.prompt_responses ENABLE ROW LEVEL SECURITY;

-- RLS policies for prompt_responses
CREATE POLICY "Users can view their own responses" 
ON public.prompt_responses FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own responses" 
ON public.prompt_responses FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own responses" 
ON public.prompt_responses FOR DELETE 
USING (auth.uid() = user_id);

-- Create index for prompt responses
CREATE INDEX idx_prompt_responses_user_date ON public.prompt_responses(user_id, created_at DESC);