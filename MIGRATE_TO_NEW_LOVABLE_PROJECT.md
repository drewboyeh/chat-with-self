# Step-by-Step: Migrate to New Lovable Project with Your Own Supabase

## Why Migrate?

- ✅ Full control over your Supabase database
- ✅ Can edit database directly
- ✅ No dependency on Lovable Cloud
- ✅ Use your existing Supabase project

---

## Step 1: Create New Lovable Project (Without Cloud)

1. Go to: https://lovable.dev
2. Click **"New Project"** or **"Create Project"**
3. **Important**: When creating the project:
   - Look for **"Enable Cloud"** or **"Backend"** option
   - **Uncheck/Disable** Cloud
   - OR choose **"Connect External Backend"** or **"Use Your Own Supabase"**
4. Name your project (e.g., "Chat with Self - My Supabase")
5. Create the project

---

## Step 2: Connect to Your GitHub Repo

Your code is already on GitHub: `drewboyeh/chat-with-self`

1. In new Lovable project, go to **Settings** or **Git**
2. Find **"Connect Repository"** or **"GitHub Integration"**
3. Connect to: `https://github.com/drewboyeh/chat-with-self`
4. Lovable will sync your code automatically

---

## Step 3: Get Your Supabase Credentials

1. Go to: https://supabase.com/dashboard/project/zsvwohwgvjshtmeoulte
2. Navigate to: **Settings** → **API**
3. Copy:
   - **Project URL**: `https://zsvwohwgvjshtmeoulte.supabase.co`
   - **anon public** key (under "Project API keys")

---

## Step 4: Set Environment Variables in Lovable

1. In new Lovable project, go to **Settings**
2. Find **"Environment Variables"** or **"Configuration"**
3. Add these variables:

```
VITE_SUPABASE_URL=https://zsvwohwgvjshtmeoulte.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key_here
```

4. **Save** and **Redeploy**

---

## Step 5: Set Up Your Supabase Database

### Run All Migrations

Go to: https://supabase.com/dashboard/project/zsvwohwgvjshtmeoulte/editor

Open **SQL Editor** and run these in order:

1. **Journal Entries Table** (if not exists):
   ```sql
   CREATE TABLE IF NOT EXISTS public.journal_entries (
     id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
     user_id UUID NOT NULL,
     content TEXT NOT NULL,
     role TEXT NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
   );
   
   ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
   
   CREATE POLICY "Users can view their own entries" 
   ON public.journal_entries FOR SELECT 
   USING (auth.uid() = user_id);
   
   CREATE POLICY "Users can create their own entries" 
   ON public.journal_entries FOR INSERT 
   WITH CHECK (auth.uid() = user_id);
   ```

2. **Reminders Table**:
   - Run: `supabase/migrations/20251224030000_create_reminders.sql`
   - Or copy from: `supabase/complete_setup.sql`

3. **Streaks Table**:
   - Run: `STREAK_SETUP.sql`

4. **Rewards System** (if you had it):
   - Run: `REWARDS_SETUP.sql`

5. **Goal Art System** (if you want it):
   - Run: `GOAL_ART_SYSTEM_SETUP.sql`

6. **Verification Codes** (for email verification):
   - Run: `VERIFICATION_CODES_SETUP.sql`

### Enable Anonymous Auth

1. In Supabase dashboard, go to: **Authentication** → **Providers**
2. Enable **"Anonymous"** provider
3. Save

---

## Step 6: Verify Connection

1. Open your new Lovable app
2. Open browser console (F12)
3. Look for:
   ```
   🔍 Supabase URL: https://zsvwohwgvjshtmeoulte.supabase.co
   🔍 Supabase Key exists: true
   ```
4. If you see your URL, it's working! ✅

---

## Step 7: Test the App

1. Try creating a journal entry
2. Try setting a reminder
3. Try creating a goal
4. Check Supabase dashboard → **Table Editor** to see your data

---

## Step 8: Update Supabase Edge Functions (If Needed)

If you have Edge Functions (like `chat-journal`):

1. Go to: https://supabase.com/dashboard/project/zsvwohwgvjshtmeoulte/functions
2. Deploy functions from: `supabase/functions/`
3. Set any required secrets (like `LOVABLE_API_KEY`, `RESEND_API_KEY`)

---

## Troubleshooting

### "Can't find Environment Variables in Lovable"

- Look in: **Settings** → **Configuration** → **Environment Variables**
- Or: **Project Settings** → **Deployment** → **Environment Variables**
- If still can't find, contact Lovable support

### "Connection Failed"

- Double-check Supabase URL (should end with `.supabase.co`)
- Verify anon key is correct
- Check browser console for specific errors
- Make sure anonymous auth is enabled in Supabase

### "Tables Don't Exist"

- Run migrations in Supabase SQL Editor
- Check **Table Editor** in Supabase to verify tables exist
- Refresh schema cache: `NOTIFY pgrst, 'reload schema';`

---

## What You Now Have

✅ **Full control** over your Supabase database  
✅ **Direct access** to edit tables, run SQL, manage data  
✅ **Your own Supabase project** (`zsvwohwgvjshtmeoulte`)  
✅ **Lovable frontend** connected to your backend  
✅ **No dependency** on Lovable Cloud  

---

## Next Steps

1. **Customize your database** as needed
2. **Run additional migrations** when needed
3. **Manage users and auth** directly in Supabase
4. **Scale independently** - your database, your rules

---

## Your Supabase Project

- **Project ID**: `zsvwohwgvjshtmeoulte`
- **URL**: `https://zsvwohwgvjshtmeoulte.supabase.co`
- **Dashboard**: https://supabase.com/dashboard/project/zsvwohwgvjshtmeoulte

You're now in full control! 🎉

