# Complete Database Setup - Correct Order

## ⚠️ Important: Run These in Order!

If you get an error like "relation does not exist", it means you're missing a table. Run the files in this exact order:

---

## ✅ Step 1: Create Goals Table (Run This First!)

**File: CREATE_GOALS_TABLE.sql**

Copy and paste this:

```sql
-- Create goals table for tracking user goals
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

-- RLS policies for goals
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
```

**✅ Expected Result:** Table `goals` created

---

## ✅ Step 2: STREAK_SETUP.sql

Run the STREAK_SETUP.sql file (from previous message)

**✅ Expected Result:** Table `user_streaks` created

---

## ✅ Step 3: REWARDS_SETUP.sql

Run the REWARDS_SETUP.sql file (from previous message)

**✅ Expected Result:** Tables `user_rewards`, `achievement_definitions`, `user_achievements`, `points_history` created

---

## ✅ Step 4: VERIFICATION_CODES_SETUP.sql

Run the VERIFICATION_CODES_SETUP.sql file (from previous message)

**✅ Expected Result:** Table `verification_codes` created

---

## ✅ Step 5: GOAL_ART_SYSTEM_SETUP.sql

**NOW** you can run GOAL_ART_SYSTEM_SETUP.sql (it needs the `goals` table from Step 1)

Run the GOAL_ART_SYSTEM_SETUP.sql file (from previous message)

**✅ Expected Result:** Tables `goal_completions`, `art_pieces`, `art_milestones` created, and `goals` table extended

---

## ✅ Step 6: Refresh Schema Cache

After running all files:

```sql
NOTIFY pgrst, 'reload schema';
```

---

## 📋 Complete Checklist

Run in this exact order:

- [ ] **Step 1:** CREATE_GOALS_TABLE.sql (see above)
- [ ] **Step 2:** STREAK_SETUP.sql
- [ ] **Step 3:** REWARDS_SETUP.sql
- [ ] **Step 4:** VERIFICATION_CODES_SETUP.sql
- [ ] **Step 5:** GOAL_ART_SYSTEM_SETUP.sql (requires goals table from Step 1)
- [ ] **Step 6:** `NOTIFY pgrst, 'reload schema';`

---

## 🆘 If You Still Get Errors

### "relation does not exist"
- Make sure you ran Step 1 (CREATE_GOALS_TABLE.sql) BEFORE Step 5
- Check that the table was created: Run `SELECT * FROM public.goals LIMIT 1;`

### "policy already exists"
- This is fine! The script handles this with `IF NOT EXISTS` or `DROP POLICY IF EXISTS`

### "column already exists"
- This is fine! The script uses `ADD COLUMN IF NOT EXISTS`

---

## ✅ Verify Everything Works

After all steps, verify tables exist:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

You should see:
- `goals` ✅
- `user_streaks` ✅
- `user_rewards` ✅
- `achievement_definitions` ✅
- `user_achievements` ✅
- `points_history` ✅
- `verification_codes` ✅
- `goal_completions` ✅
- `art_pieces` ✅
- `art_milestones` ✅

