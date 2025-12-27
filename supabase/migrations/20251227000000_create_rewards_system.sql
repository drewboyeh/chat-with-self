-- Rewards and Achievements System
-- Tracks points, achievements, and rewards for user accomplishments

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

-- Achievement definitions (what achievements exist)
CREATE TABLE IF NOT EXISTS public.achievement_definitions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE, -- e.g., 'first_reminder', 'goal_master', 'streak_7'
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT, -- emoji or icon name
  points INTEGER NOT NULL DEFAULT 0,
  category TEXT NOT NULL DEFAULT 'general', -- reminder, goal, streak, journal, milestone
  requirement INTEGER NOT NULL, -- e.g., 1 reminder, 7 day streak, 10 goals
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User achievements (which achievements each user has earned)
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  achievement_id UUID NOT NULL REFERENCES public.achievement_definitions(id),
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- Points history (track where points came from)
CREATE TABLE IF NOT EXISTS public.points_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  points INTEGER NOT NULL,
  source TEXT NOT NULL, -- 'reminder_completed', 'goal_completed', 'achievement', 'journal_entry'
  source_id UUID, -- ID of the reminder/goal/achievement that earned points
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.points_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_rewards
CREATE POLICY "Users can view their own rewards" 
ON public.user_rewards FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own rewards" 
ON public.user_rewards FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "System can insert rewards" 
ON public.user_rewards FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_achievements
CREATE POLICY "Users can view their own achievements" 
ON public.user_achievements FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can insert achievements" 
ON public.user_achievements FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for points_history
CREATE POLICY "Users can view their own points history" 
ON public.points_history FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can insert points history" 
ON public.points_history FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_rewards_user_id ON public.user_rewards(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON public.user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement_id ON public.user_achievements(achievement_id);
CREATE INDEX IF NOT EXISTS idx_points_history_user_id ON public.points_history(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_achievement_definitions_code ON public.achievement_definitions(code);

-- Insert default achievement definitions
INSERT INTO public.achievement_definitions (code, name, description, icon, points, category, requirement) VALUES
-- Reminder achievements
('first_reminder', 'Getting Started', 'Complete your first reminder', '🎯', 10, 'reminder', 1),
('reminder_5', 'Building Habits', 'Complete 5 reminders', '🔥', 25, 'reminder', 5),
('reminder_10', 'Consistency Champion', 'Complete 10 reminders', '⭐', 50, 'reminder', 10),
('reminder_25', 'Habit Master', 'Complete 25 reminders', '💪', 100, 'reminder', 25),
('reminder_50', 'Unstoppable', 'Complete 50 reminders', '🏆', 250, 'reminder', 50),

-- Goal achievements
('first_goal', 'Goal Setter', 'Complete your first goal', '🎯', 20, 'goal', 1),
('goal_5', 'Goal Achiever', 'Complete 5 goals', '🌟', 75, 'goal', 5),
('goal_10', 'Goal Master', 'Complete 10 goals', '👑', 200, 'goal', 10),
('goal_20', 'Goal Legend', 'Complete 20 goals', '💎', 500, 'goal', 20),

-- Streak achievements
('streak_3', 'Getting Started', '3 day streak', '🔥', 15, 'streak', 3),
('streak_7', 'Week Warrior', '7 day streak', '⭐', 50, 'streak', 7),
('streak_14', 'Two Week Champion', '14 day streak', '💪', 150, 'streak', 14),
('streak_30', 'Monthly Master', '30 day streak', '🏆', 500, 'streak', 30),
('streak_60', 'Two Month Legend', '60 day streak', '👑', 1000, 'streak', 60),
('streak_100', 'Century Club', '100 day streak', '💎', 2500, 'streak', 100),

-- Journal achievements
('journal_10', 'Reflection Starter', 'Write 10 journal entries', '📝', 30, 'journal', 10),
('journal_25', 'Thoughtful Writer', 'Write 25 journal entries', '✍️', 100, 'journal', 25),
('journal_50', 'Journal Master', 'Write 50 journal entries', '📚', 300, 'journal', 50),
('journal_100', 'Reflection Legend', 'Write 100 journal entries', '🌟', 750, 'journal', 100),

-- Milestone achievements
('points_100', 'Point Collector', 'Earn 100 points', '💰', 0, 'milestone', 100),
('points_500', 'Point Accumulator', 'Earn 500 points', '💵', 0, 'milestone', 500),
('points_1000', 'Point Master', 'Earn 1,000 points', '💸', 0, 'milestone', 1000),
('points_5000', 'Point Legend', 'Earn 5,000 points', '💴', 0, 'milestone', 5000)
ON CONFLICT (code) DO NOTHING;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_rewards_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for user_rewards
CREATE TRIGGER update_user_rewards_updated_at
BEFORE UPDATE ON public.user_rewards
FOR EACH ROW
EXECUTE FUNCTION update_rewards_updated_at();

