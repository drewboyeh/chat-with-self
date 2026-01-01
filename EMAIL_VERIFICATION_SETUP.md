# Email Verification Setup (FREE)

## Why Email Verification?
- **100% FREE** - No API costs
- **Works immediately** - No trial restrictions
- **Simple setup** - Uses Supabase email or Resend
- **Reliable** - Email delivery is very reliable

## Option 1: Use Resend (Recommended - Free Tier)

### Setup
1. Sign up at https://resend.com (free tier: 3,000 emails/month)
2. Get API key from dashboard
3. Add to Supabase Edge Functions secrets: `RESEND_API_KEY`

### Implementation
The code will send verification code via email instead of SMS.

## Option 2: Use Supabase Email (Free)

Supabase has built-in email, but it requires:
- SMTP configuration in Supabase dashboard
- Or use Supabase's default email (may have limits)

## Option 3: Simple Email Display (For Testing)

For now, we can show the code in the UI/toast notification.
User enters their email, we generate code, show it to them.

## Recommendation

**For immediate use**: Show code in UI (works now, no setup)
**For production**: Use Resend (free tier, professional)


