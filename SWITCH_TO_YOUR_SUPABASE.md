# Switch Lovable to Your Supabase Project

## Current Situation
- **Lovable is using**: `fjkwpxppsblagioijjbs` (Lovable's default project)
- **Your project is**: `zsvwohwgvjshtmeoulte` (the one you created)

## Option 1: Use Your Supabase Project (Recommended)

### Step 1: Get Your Supabase Keys
1. Go to: https://supabase.com/dashboard/project/zsvwohwgvjshtmeoulte/settings/api
2. Copy:
   - **URL**: `https://zsvwohwgvjshtmeoulte.supabase.co`
   - **anon public key**: (under "Project API keys")

### Step 2: Update Lovable Environment Variables
1. Go to your Lovable project dashboard
2. Navigate to **Project Settings** → **Environment Variables**
3. Update these variables:
   - `VITE_SUPABASE_URL` = `https://zsvwohwgvjshtmeoulte.supabase.co`
   - `VITE_SUPABASE_PUBLISHABLE_KEY` = (your anon public key from step 1)
4. Save and wait 2-5 minutes for rebuild

### Step 3: Set Up Database Tables in Your Project
1. Go to: https://supabase.com/dashboard/project/zsvwohwgvjshtmeoulte/editor
2. Open **SQL Editor**
3. Run the migration files:
   - First: `supabase/migrations/20251225181816_22d47357-332f-41b5-93ea-74e5ca563bf9.sql` (creates reminders table)
   - Then: `supabase/migrations/20251225200000_add_timezone_to_reminders.sql` (adds timezone column)
   - Also create `journal_entries` table if it doesn't exist

## Option 2: Use Lovable's Supabase Project

If you want to keep using `fjkwpxppsblagioijjbs`:
1. Make sure the environment variables in Lovable are set correctly
2. Run the same migrations in that project's SQL Editor
3. The app should work with that project

## Which Should You Use?

**Use your project (`zsvwohwgvjshtmeoulte`)** if:
- You want full control over your database
- You want to manage your own Supabase project
- You plan to use this database for other projects

**Use Lovable's project (`fjkwpxppsblagioijjbs`)** if:
- You want Lovable to manage everything
- You don't need to access the database outside Lovable
- You're okay with Lovable's default setup

## Verify Connection

After switching, check browser console:
- Should show: `🔍 Supabase URL: https://zsvwohwgvjshtmeoulte.supabase.co` (or the one you're using)
- Should show: `🔍 Supabase Key exists: true`

