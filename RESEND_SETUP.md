# Resend Email Verification Setup

## Why Resend?
- **FREE**: 3,000 emails/month free tier
- **No credit card required** for free tier
- **Easy setup**: Just API key
- **Reliable**: Professional email delivery
- **Works immediately**: No trial restrictions

## Setup Steps

### 1. Sign Up for Resend
1. Go to https://resend.com
2. Click "Sign Up" (free)
3. Verify your email
4. No credit card required for free tier

### 2. Get API Key
1. Go to https://resend.com/api-keys
2. Click "Create API Key"
3. Name it (e.g., "Supabase Edge Function")
4. Copy the API key (starts with `re_`)

### 3. Add to Supabase Edge Functions
Ask Lovable agent to set this secret in Supabase Edge Functions:
- `RESEND_API_KEY` - Your Resend API key (starts with `re_`)

### 4. Verify Domain (Optional)
For production, verify your domain in Resend dashboard.
For testing, you can use Resend's test domain.

## That's It!
Once the API key is set, email verification will work automatically.

## Free Tier Limits
- 3,000 emails/month
- 100 emails/day
- Perfect for getting started!

## Upgrade (When Needed)
- Pro: $20/month for 50,000 emails
- Only upgrade when you exceed free tier

