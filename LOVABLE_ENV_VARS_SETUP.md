# How to Connect Your Own Supabase to Lovable

## Quick Setup Guide

### Step 1: Get Your Supabase Credentials

1. Go to: https://supabase.com/dashboard/project/zsvwohwgvjshtmeoulte
2. Navigate to: **Settings** → **API**
3. Copy these values:
   - **Project URL** (looks like: `https://zsvwohwgvjshtmeoulte.supabase.co`)
   - **anon public** key (the publishable key, starts with `eyJ...`)

### Step 2: Update Lovable Environment Variables

1. In Lovable dashboard, go to your project
2. Find **Settings** or **Environment Variables** section
3. Add/Update these variables:

```
VITE_SUPABASE_URL=https://zsvwohwgvjshtmeoulte.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key_here
```

4. **Save** and **Redeploy** your app

### Step 3: Verify Connection

1. Open your Lovable app
2. Check browser console for Supabase connection logs
3. Try creating a goal or journal entry
4. Check Supabase dashboard → Table Editor to see the data

### That's It!

Now Lovable uses YOUR Supabase, and you have full control:
- ✅ Access Supabase dashboard directly
- ✅ Run SQL migrations
- ✅ Edit tables and data
- ✅ Manage everything yourself

---

## Troubleshooting

### If connection fails:
1. Double-check the URL (should end with `.supabase.co`)
2. Verify the anon key is correct (starts with `eyJ`)
3. Make sure you saved and redeployed in Lovable
4. Check browser console for error messages

### If you can't find Environment Variables in Lovable:
1. Look for **Settings** or **Configuration** menu
2. Check **Project Settings** or **Deployment Settings**
3. Some Lovable projects have it under **Advanced Settings**
4. If you can't find it, Lovable support can help you set it up

---

## Alternative: Use Supabase CLI

If Lovable doesn't have environment variable UI:

1. **Set up Supabase CLI locally:**
   ```bash
   npm install -g supabase
   supabase login
   supabase link --project-ref zsvwohwgvjshtmeoulte
   ```

2. **Your local `.env` will work:**
   ```bash
   # .env.local
   VITE_SUPABASE_URL=https://zsvwohwgvjshtmeoulte.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=your_key
   ```

3. **Lovable will sync from GitHub** (which has your code pointing to your Supabase)

---

## Remember

- Your Supabase is **completely independent** from Lovable
- You can access it at: https://supabase.com/dashboard/project/zsvwohwgvjshtmeoulte
- You have **full control** over your database
- Lovable is just the frontend - the database is yours!

