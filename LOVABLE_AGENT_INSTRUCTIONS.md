# Instructions for Lovable Agent

Since Lovable automatically created your Supabase project, you need to use Lovable's agent to set up the database tables.

## Quick Instructions for Lovable Agent

**Copy and paste this to Lovable's agent:**

```
I need to set up the database tables for the reminders feature. Please run this SQL in the Supabase SQL Editor:

[Paste the contents of LOVABLE_DATABASE_SETUP.sql]

This will:
1. Create the reminders table with all required columns including timezone
2. Set up Row Level Security (RLS) policies
3. Add the timezone column if the table already exists but is missing it
```

## What This Does

- Creates the `reminders` table with columns: id, user_id, task, reminder_time, recurrence, is_active, completed_at, last_notified_at, **timezone**, created_at
- Sets up security policies so users can only see/edit their own reminders
- Handles the case where the table exists but is missing the timezone column

## After Running

1. Wait 30-60 seconds for Supabase's schema cache to refresh
2. Try creating a reminder in your app
3. It should work now!

## Alternative: Manual Steps

If you prefer to do it manually in Lovable:

1. Go to your Lovable project
2. Look for "Database" or "Supabase" in the left sidebar
3. Open "SQL Editor"
4. Paste the SQL from `LOVABLE_DATABASE_SETUP.sql`
5. Click "Run"

