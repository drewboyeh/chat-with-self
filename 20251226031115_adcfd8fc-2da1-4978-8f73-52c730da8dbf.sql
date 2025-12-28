-- Add timezone column to reminders table
ALTER TABLE public.reminders
ADD COLUMN IF NOT EXISTS timezone TEXT NOT NULL DEFAULT 'UTC';

-- Backfill existing rows (defensive; should already be default)
UPDATE public.reminders
SET timezone = 'UTC'
WHERE timezone IS NULL;

-- Ask the API layer to reload schema
NOTIFY pgrst, 'reload schema';