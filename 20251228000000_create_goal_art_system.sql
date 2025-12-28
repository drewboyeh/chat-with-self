-- Goal-Based Art Collection System
-- Users unlock art pieces by completing goals over different timeframes

-- Extend goals table with timeframe and recurrence
ALTER TABLE public.goals 
ADD COLUMN IF NOT EXISTS timeframe TEXT DEFAULT 'monthly' CHECK (timeframe IN ('daily', 'weekly', 'monthly', 'yearly', 'long_term')),
ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS recurrence_pattern TEXT, -- 'daily', 'weekly', 'monthly'
ADD COLUMN IF NOT EXISTS art_piece_id UUID; -- Reference to art piece when goal is associated with art

-- Goal completion history (tracks each completion for recurring goals)
CREATE TABLE IF NOT EXISTS public.goal_completions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  goal_id UUID NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completion_type TEXT NOT NULL DEFAULT 'single', -- 'single', 'daily', 'weekly', 'monthly', 'yearly'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Art pieces collection
CREATE TABLE IF NOT EXISTS public.art_pieces (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  goal_id UUID REFERENCES public.goals(id) ON DELETE SET NULL, -- Null for standalone art
  art_type TEXT NOT NULL, -- 'daily', 'weekly', 'monthly', 'yearly', 'long_term', 'masterpiece'
  size TEXT NOT NULL DEFAULT 'small' CHECK (size IN ('small', 'medium', 'large', 'masterpiece')),
  fame_level TEXT NOT NULL DEFAULT 'common' CHECK (fame_level IN ('common', 'uncommon', 'rare', 'epic', 'legendary')),
  title TEXT NOT NULL,
  description TEXT,
  art_data JSONB NOT NULL, -- Stores SVG/art definition
  completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100), -- For long-term goals
  unlocked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Art piece milestones (for tracking progress toward unlocking art)
CREATE TABLE IF NOT EXISTS public.art_milestones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  art_piece_id UUID NOT NULL REFERENCES public.art_pieces(id) ON DELETE CASCADE,
  goal_id UUID NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
  milestone_type TEXT NOT NULL, -- 'daily_complete', 'week_complete', 'month_complete', 'year_complete'
  target_count INTEGER NOT NULL, -- e.g., 7 for weekly, 30 for monthly
  current_count INTEGER NOT NULL DEFAULT 0,
  achieved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.goal_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.art_pieces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.art_milestones ENABLE ROW LEVEL SECURITY;

-- RLS Policies for goal_completions
CREATE POLICY "Users can view their own goal completions" 
ON public.goal_completions FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own goal completions" 
ON public.goal_completions FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own goal completions" 
ON public.goal_completions FOR DELETE 
USING (auth.uid() = user_id);

-- RLS Policies for art_pieces
CREATE POLICY "Users can view their own art pieces" 
ON public.art_pieces FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own art pieces" 
ON public.art_pieces FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own art pieces" 
ON public.art_pieces FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own art pieces" 
ON public.art_pieces FOR DELETE 
USING (auth.uid() = user_id);

-- RLS Policies for art_milestones
CREATE POLICY "Users can view their own art milestones" 
ON public.art_milestones FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.art_pieces 
    WHERE art_pieces.id = art_milestones.art_piece_id 
    AND art_pieces.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create their own art milestones" 
ON public.art_milestones FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.art_pieces 
    WHERE art_pieces.id = art_milestones.art_piece_id 
    AND art_pieces.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own art milestones" 
ON public.art_milestones FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.art_pieces 
    WHERE art_pieces.id = art_milestones.art_piece_id 
    AND art_pieces.user_id = auth.uid()
  )
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_goal_completions_goal_id ON public.goal_completions(goal_id);
CREATE INDEX IF NOT EXISTS idx_goal_completions_user_date ON public.goal_completions(user_id, completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_art_pieces_user_id ON public.art_pieces(user_id);
CREATE INDEX IF NOT EXISTS idx_art_pieces_goal_id ON public.art_pieces(goal_id);
CREATE INDEX IF NOT EXISTS idx_art_pieces_type ON public.art_pieces(art_type);
CREATE INDEX IF NOT EXISTS idx_art_milestones_art_piece_id ON public.art_milestones(art_piece_id);
CREATE INDEX IF NOT EXISTS idx_art_milestones_goal_id ON public.art_milestones(goal_id);

