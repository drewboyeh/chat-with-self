# Database Migration Instructions

## To enable reminders feature, you need to run the migration in Supabase:

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard: https://supabase.com/dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste the contents of `supabase/migrations/20251224030000_create_reminders.sql`
5. Click **Run** (or press Cmd/Ctrl + Enter)
6. You should see "Success. No rows returned"

### Option 2: Using Supabase CLI

If you have Supabase CLI installed:

```bash
supabase db push
```

This will run all pending migrations.

### Verify the migration worked:

After running the migration, try creating a reminder again. It should work!

If you still get errors, check:
- The table exists: Go to Supabase Dashboard → Table Editor → You should see `reminders` table
- RLS policies are set: Go to Authentication → Policies → You should see policies for `reminders` table

