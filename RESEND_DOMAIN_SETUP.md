# Resend Domain Verification - Send to Any Email

## The Problem

Currently, your Resend setup is using the test domain `onboarding@resend.dev`. **Resend's test domain only allows sending to verified recipient emails** in your account. That's why only `drewboyeh@gmail.com` works.

## The Solution: Verify Your Domain

To send verification codes to **any email address**, you need to verify your own domain in Resend.

---

## Step-by-Step: Verify Your Domain in Resend

### Step 1: Go to Resend Dashboard
1. Go to https://resend.com/domains
2. Click **"Add Domain"** or **"Verify Domain"**

### Step 2: Enter Your Domain
- Enter your domain (e.g., `yourdomain.com`)
- Or use a subdomain (e.g., `mail.yourdomain.com` or `verify.yourdomain.com`)

### Step 3: Add DNS Records
Resend will show you DNS records to add. You need to add these to your domain's DNS settings:

**Example DNS records:**
```
Type: TXT
Name: @
Value: resend-verification=abc123xyz

Type: CNAME
Name: resend._domainkey
Value: resend._domainkey.resend.com
```

### Step 4: Wait for Verification
- Resend will verify your domain (usually takes 5-30 minutes)
- You'll see a green checkmark when verified

### Step 5: Update Supabase Edge Function
Once verified, update the `from` email in your Edge Function:

**In Supabase Edge Functions:**
- Go to your `send-verification-code` function
- Update line 138 from:
  ```typescript
  from: "onboarding@resend.dev",
  ```
- To:
  ```typescript
  from: "verify@yourdomain.com",  // or whatever email you want
  ```

---

## Alternative: Add More Verified Recipients (Temporary)

If you don't have a domain yet, you can add more recipient emails to Resend:

1. Go to https://resend.com/emails
2. Look for **"Verified Recipients"** or **"Test Emails"**
3. Add email addresses you want to test with
4. Verify them via email

**Limitation:** This only works for a few test emails, not production.

---

## Free Domain Options

If you don't have a domain:

1. **Freenom** (free domains like `.tk`, `.ml`, `.ga`)
2. **Namecheap** ($1-2/year for `.xyz` domains)
3. **Cloudflare** ($8-10/year for `.com` domains)

---

## After Domain Verification

Once your domain is verified:
- ✅ Can send to **any email address**
- ✅ Professional sender address (e.g., `verify@yourdomain.com`)
- ✅ Better deliverability
- ✅ No recipient restrictions

---

## Quick Test

After verifying your domain, test with:
- Your own email
- A friend's email
- Any email address

All should work! 🎉

