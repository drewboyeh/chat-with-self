# AWS SNS SMS Setup Guide

## Why AWS SNS?
- **Very cheap**: $0.00645 per SMS in US (less than 1 cent!)
- **No trial restrictions**: Works immediately
- **Reliable**: Amazon infrastructure
- **Pay-as-you-go**: No monthly fees

## Setup Steps

### 1. Create AWS Account
1. Go to https://aws.amazon.com/
2. Sign up (requires credit card, but very cheap)
3. Verify your account

### 2. Get AWS Credentials
1. Go to AWS Console → IAM → Users
2. Create a new user (or use existing)
3. Attach policy: `AmazonSNSFullAccess` (or create custom policy)
4. Create Access Key:
   - Go to Security Credentials tab
   - Create Access Key
   - Save: `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`

### 3. Set Up SNS
1. Go to AWS Console → SNS
2. No additional setup needed for SMS
3. Note your region (e.g., `us-east-1`)

### 4. Add to Supabase Edge Functions
Ask Lovable agent to set these secrets:
- `AWS_ACCESS_KEY_ID` - Your AWS access key
- `AWS_SECRET_ACCESS_KEY` - Your AWS secret key
- `AWS_REGION` - Your AWS region (e.g., `us-east-1`)

### 5. Update Code
The Edge Function needs AWS SDK. For Deno, use:
```typescript
import { SNSClient, PublishCommand } from "https://esm.sh/@aws-sdk/client-sns@3";
```

## Cost Estimate
- 1,000 SMS = $6.45
- 10,000 SMS = $64.50
- Very affordable for production!

## Alternative: Use Resend for Email (Free Tier)
If you want email verification instead:
- Sign up at https://resend.com
- Free tier: 3,000 emails/month
- Easy API integration


