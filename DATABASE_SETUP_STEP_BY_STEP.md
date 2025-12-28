# Step-by-Step Database Setup Guide

## 🎯 Overview

This guide will help you set up all the database tables needed for your app. Run these SQL scripts in order in your Supabase SQL Editor.

---

## 📍 Step 1: Open Supabase SQL Editor

1. Go to: **https://supabase.com/dashboard/project/zsvwohwgvjshtmeoulte**
2. Click **"SQL Editor"** in the left sidebar
3. Click **"New query"** button

---

## 📋 Step 2: Check What Already Exists

Before running migrations, let's see what tables you already have:

```sql
-- Run this to see existing tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

**Common tables you might already have:**
- `journal_entries` ✅ (if you have journaling)
- `goals` ✅ (if you have goals)
- `reminders` ✅ (if you have reminders)
- `user_streaks` ❓ (might not exist)
- `user_rewards` ❓ (might not exist)
- `art_pieces` ❓ (probably doesn't exist)

---

## 🗄️ Step 3: Run Migrations in Order

Run each SQL script below in the SQL Editor. Copy the entire script, paste it, and click **"Run"** or press `Cmd+Enter` (Mac) / `Ctrl+Enter` (Windows).

---

### ✅ Migration 1: Journal Entries (If Not Exists)

**Skip if you already have `journal_entries` table**

```sql
-- Create journal_entries table
CREATE TABLE IF NOT EXISTS public.journal_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  role TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY IF NOT EXISTS "Users can view their own entries" 
ON public.journal_entries FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can create their own entries" 
ON public.journal_entries FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can delete their own entries" 
ON public.journal_entries FOR DELETE 
USING (auth.uid() = user_id);

-- Create index
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_id ON public.journal_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_created_at ON public.journal_entries(created_at DESC);
```

**✅ Expected Result:** Table `journal_entries` created (or already exists)

---

### ✅ Migration 2: Goals Table (If Not Exists)

**Skip if you already have `goals` table**

```sql
-- Create goals table
CREATE TABLE IF NOT EXISTS public.goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'personal',
  status TEXT NOT NULL DEFAULT 'active',
  target_date DATE,
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY IF NOT EXISTS "Users can view their own goals" 
ON public.goals FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can create their own goals" 
ON public.goals FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update their own goals" 
ON public.goals FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can delete their own goals" 
ON public.goals FOR DELETE 
USING (auth.uid() = user_id);

-- Create index
CREATE INDEX IF NOT EXISTS idx_goals_user_status ON public.goals(user_id, status);
```

**✅ Expected Result:** Table `goals` created (or already exists)

---

### ✅ Migration 3: Reminders Table (If Not Exists)

**Skip if you already have `reminders` table**

```sql
-- Create reminders table
CREATE TABLE IF NOT EXISTS public.reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  message TEXT NOT NULL,
  reminder_time TIMESTAMP WITH TIME ZONE NOT NULL,
  timezone TEXT,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY IF NOT EXISTS "Users can view their own reminders" 
ON public.reminders FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can create their own reminders" 
ON public.reminders FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update their own reminders" 
ON public.reminders FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can delete their own reminders" 
ON public.reminders FOR DELETE 
USING (auth.uid() = user_id);

-- Create index
CREATE INDEX IF NOT EXISTS idx_reminders_user_id ON public.reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_reminders_reminder_time ON public.reminders(reminder_time);
```

**✅ Expected Result:** Table `reminders` created (or already exists)

---

### ✅ Migration 4: Streak Counter

**Run this to enable streak tracking**

Copy and run the entire contents of: **`STREAK_SETUP.sql`**

Or run this:

```sql
-- Create user_streaks table
CREATE TABLE IF NOT EXISTS public.user_streaks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_journal_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY IF NOT EXISTS "Users can view their own streak" 
ON public.user_streaks FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can create their own streak" 
ON public.user_streaks FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update their own streak" 
ON public.user_streaks FOR UPDATE 
USING (auth.uid() = user_id);

-- Create index
CREATE INDEX IF NOT EXISTS idx_user_streaks_user_id ON public.user_streaks(user_id);

-- Create function to update updated_at
CREATE OR REPLACE FUNCTION update_user_streaks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS update_user_streaks_updated_at ON public.user_streaks;
CREATE TRIGGER update_user_streaks_updated_at
BEFORE UPDATE ON public.user_streaks
FOR EACH ROW
EXECUTE FUNCTION update_user_streaks_updated_at();
```

**✅ Expected Result:** Table `user_streaks` created

---

### ✅ Migration 5: Rewards System (Points, Levels, Achievements)

**Run this to enable rewards/points system**

Copy and run the entire contents of: **`REWARDS_SETUP.sql`**

Or see the full script below (it's long, so I'll show it in the next section).

**✅ Expected Result:** Tables `user_rewards`, `achievement_definitions`, `user_achievements`, `points_history` created

---

### ✅ Migration 6: Verification Codes (For Email Verification)

**Run this if you use email verification**

Copy and run the entire contents of: **`VERIFICATION_CODES_SETUP.sql`**

**✅ Expected Result:** Table `verification_codes` created

---

### ✅ Migration 7: Goal Art System (Optional - For Art Collection Feature)

**Run this if you want the art collection feature**

Copy and run the entire contents of: **`GOAL_ART_SYSTEM_SETUP.sql`**

**✅ Expected Result:** Tables `goal_completions`, `art_pieces`, `art_milestones` created, and `goals` table extended

---

## 📝 Full SQL Scripts

Below are the complete scripts for the larger migrations:

---

### 🔥 REWARDS_SETUP.sql (Full Script)

See file: `REWARDS_SETUP.sql` in your project root.

This creates:
- `user_rewards` - stores user points, level, goals completed
- `achievement_definitions` - defines achievements
- `user_achievements` - tracks which achievements users have
- `points_history` - logs all point transactions

---

### 🔥 VERIFICATION_CODES_SETUP.sql (Full Script)

See file: `VERIFICATION_CODES_SETUP.sql` in your project root.

This creates:
- `verification_codes` - stores email verification codes

---

### 🔥 GOAL_ART_SYSTEM_SETUP.sql (Full Script)

See file: `GOAL_ART_SYSTEM_SETUP.sql` in your project root.

This creates:
- `goal_completions` - tracks goal completions
- `art_pieces` - stores unlocked art pieces
- `art_milestones` - tracks art unlocking milestones
- Extends `goals` table with timeframe and art fields

---

## ✅ Step 4: Verify Everything Works

After running all migrations, verify:

```sql
-- Check all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

**You should see:**
- `journal_entries` ✅
- `goals` ✅
- `reminders` ✅
- `user_streaks` ✅
- `user_rewards` ✅ (if you ran rewards setup)
- `achievement_definitions` ✅ (if you ran rewards setup)
- `user_achievements` ✅ (if you ran rewards setup)
- `points_history` ✅ (if you ran rewards setup)
- `verification_codes` ✅ (if you ran verification setup)
- `goal_completions` ✅ (if you ran art system setup)
- `art_pieces` ✅ (if you ran art system setup)
- `art_milestones` ✅ (if you ran art system setup)

---

## 🔄 Step 5: Refresh Schema Cache

After running migrations, refresh Supabase's schema cache:

```sql
NOTIFY pgrst, 'reload schema';
```

This ensures the API recognizes your new tables immediately.

---

## 🎯 Step 6: Enable Anonymous Authentication

1. In Supabase dashboard, go to: **Authentication** → **Providers**
2. Find **"Anonymous"** provider
3. **Enable** it
4. **Save**

This allows users to sign in without email/password.

---

## ✅ Step 7: Test Your App

1. Open your Lovable app
2. Try creating a journal entry
3. Try creating a goal
4. Try setting a reminder
5. Check Supabase **Table Editor** to see your data

---

## 🆘 Troubleshooting

### "Table already exists" Error
- ✅ This is fine! It means the table is already created
- You can skip that migration

### "Policy already exists" Error
- ✅ This is fine! The policy is already there
- The script handles this with `IF NOT EXISTS` or `DROP POLICY IF EXISTS`

### "Column already exists" Error
- ✅ This is fine! The column is already added
- The script uses `ADD COLUMN IF NOT EXISTS` to handle this

### Can't see tables in Table Editor
1. Refresh the page
2. Run: `NOTIFY pgrst, 'reload schema';`
3. Wait 30 seconds and refresh again

### App still shows errors
1. Check browser console for specific errors
2. Verify environment variables are set in Lovable
3. Make sure you ran `NOTIFY pgrst, 'reload schema';`
4. Hard refresh your app (Cmd+Shift+R)

---

## 📋 Quick Checklist

- [ ] Opened Supabase SQL Editor
- [ ] Ran journal_entries migration (if needed)
- [ ] Ran goals migration (if needed)
- [ ] Ran reminders migration (if needed)
- [ ] Ran STREAK_SETUP.sql
- [ ] Ran REWARDS_SETUP.sql (if you want rewards)
- [ ] Ran VERIFICATION_CODES_SETUP.sql (if you use email verification)
- [ ] Ran GOAL_ART_SYSTEM_SETUP.sql (if you want art collection)
- [ ] Ran `NOTIFY pgrst, 'reload schema';`
- [ ] Enabled Anonymous Authentication
- [ ] Tested the app

---

## 🎉 You're Done!

Your database is now fully set up. You can:
- ✅ Create journal entries
- ✅ Set goals and track progress
- ✅ Set reminders
- ✅ Track streaks
- ✅ Earn points and achievements (if enabled)
- ✅ Unlock art pieces (if enabled)

All data is stored in **your** Supabase project, and you have full control! 🚀

