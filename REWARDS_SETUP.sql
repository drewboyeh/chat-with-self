-- Rewards System Setup for Lovable Agent
-- Run this SQL in Supabase SQL Editor

-- User points and stats
CREATE TABLE IF NOT EXISTS public.user_rewards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  total_points INTEGER NOT NULL DEFAULT 0,
  completed_reminders INTEGER NOT NULL DEFAULT 0,
  completed_goals INTEGER NOT NULL DEFAULT 0,
  journal_entries INTEGER NOT NULL DEFAULT 0,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Achievement definitions
CREATE TABLE IF NOT EXISTS public.achievement_definitions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT,
  points INTEGER NOT NULL DEFAULT 0,
  category TEXT NOT NULL DEFAULT 'general',
  requirement INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User achievements
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  achievement_id UUID NOT NULL REFERENCES public.achievement_definitions(id),
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- Points history
CREATE TABLE IF NOT EXISTS public.points_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  points INTEGER NOT NULL,
  source TEXT NOT NULL,
  source_id UUID,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.points_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own rewards" ON public.user_rewards FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own rewards" ON public.user_rewards FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "System can insert rewards" ON public.user_rewards FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own achievements" ON public.user_achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can insert achievements" ON public.user_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own points history" ON public.points_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can insert points history" ON public.points_history FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_rewards_user_id ON public.user_rewards(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON public.user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_points_history_user_id ON public.points_history(user_id, created_at DESC);

-- Insert achievement definitions
INSERT INTO public.achievement_definitions (code, name, description, icon, points, category, requirement) VALUES
('first_reminder', 'Getting Started', 'Complete your first reminder', '🎯', 10, 'reminder', 1),
('reminder_5', 'Building Habits', 'Complete 5 reminders', '🔥', 25, 'reminder', 5),
('reminder_10', 'Consistency Champion', 'Complete 10 reminders', '⭐', 50, 'reminder', 10),
('first_goal', 'Goal Setter', 'Complete your first goal', '🎯', 20, 'goal', 1),
('goal_5', 'Goal Achiever', 'Complete 5 goals', '🌟', 75, 'goal', 5),
('streak_7', 'Week Warrior', '7 day streak', '⭐', 50, 'streak', 7),
('streak_30', 'Monthly Master', '30 day streak', '🏆', 500, 'streak', 30),
('journal_10', 'Reflection Starter', 'Write 10 journal entries', '📝', 30, 'journal', 10),
('points_100', 'Point Collector', 'Earn 100 points', '💰', 0, 'milestone', 100)
ON CONFLICT (code) DO NOTHING;

