# Supabase Connection Guide

## Your Supabase Project
- **Project ID**: `zsvwohwgvjshtmeoulte`
- **Project URL**: `https://zsvwohwgvjshtmeoulte.supabase.co`

## Required Environment Variables in Lovable

You need to set these in your Lovable project settings:

1. **VITE_SUPABASE_URL**
   - Value: `https://zsvwohwgvjshtmeoulte.supabase.co`

2. **VITE_SUPABASE_PUBLISHABLE_KEY**
   - This is your Supabase "anon" or "public" key
   - Find it in: Supabase Dashboard → Settings → API → Project API keys → `anon` `public`

## How to Set Environment Variables in Lovable

1. Go to your Lovable project dashboard
2. Navigate to **Project Settings** or **Environment Variables**
3. Add both variables above
4. Save and wait for the project to rebuild (2-5 minutes)

## How to Verify Connection

1. Open your published Lovable app
2. Open browser console (F12 or Cmd+Option+I)
3. Look for these logs:
   - `🔍 Supabase URL: https://zsvwohwgvjshtmeoulte.supabase.co`
   - `🔍 Supabase Key exists: true`

If you see a different URL or `false`, the environment variables aren't set correctly.

## Get Your Supabase Keys

1. Go to https://supabase.com/dashboard/project/zsvwohwgvjshtmeoulte
2. Click **Settings** (gear icon) → **API**
3. Under **Project API keys**, copy:
   - **URL**: Already shown (should be `https://zsvwohwgvjshtmeoulte.supabase.co`)
   - **anon public**: This is your `VITE_SUPABASE_PUBLISHABLE_KEY`

## Common Issues

- **Wrong project URL**: Make sure it's `zsvwohwgvjshtmeoulte`, not `fjkwpxppsblagioijjbs`
- **Missing key**: The `anon public` key is required, not the `service_role` key
- **Cache**: After updating env vars, wait 2-5 minutes and hard refresh (Cmd+Shift+R)

