# Twilio Phone Verification Troubleshooting

## Issue: Not Receiving SMS Codes

If you're not receiving verification codes, check these steps:

### 1. Check Browser Console
Open your browser's developer console (F12) and look for error messages when you click "Send Code".

### 2. Verify Database Table Exists
The `verification_codes` table must exist. Ask Lovable agent to run:
```sql
SELECT * FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'verification_codes';
```

If it doesn't exist, run the migration from `VERIFICATION_CODES_SETUP.sql`.

### 3. Verify Twilio Environment Variables in Supabase Edge Functions

**Important:** These must be set in **Supabase Edge Functions secrets**, not just Lovable environment variables.

Ask Lovable agent to check/set these in Supabase:
- `TWILIO_ACCOUNT_SID` - Your Twilio Account SID
- `TWILIO_AUTH_TOKEN` - Your Twilio Auth Token  
- `TWILIO_PHONE_NUMBER` - Your Twilio phone number (e.g., `+15551234567`)

### 4. Verify Twilio Phone Number Format

Your Twilio phone number should be in E.164 format:
- ✅ Correct: `+15551234567`
- ❌ Wrong: `(555) 123-4567`
- ❌ Wrong: `5551234567`

### 5. Verify User Phone Number Format

The app will automatically format `7608229903` to `+17608229903`, which is correct.

### 6. Check Twilio Console

1. Go to https://console.twilio.com/
2. Check "Monitor" → "Logs" → "Messaging" for any errors
3. Verify your Twilio phone number is active
4. Check if you have sufficient credits

### 7. Common Twilio Error Codes

- **21211**: Invalid phone number - check format
- **21608**: Twilio number not verified - verify in Twilio console
- **21408**: Permission denied - check account permissions
- **20003**: Authentication failed - check Account SID and Auth Token

### 8. Test Twilio Credentials

You can test if your Twilio credentials work by running this in a terminal:

```bash
curl -X POST https://api.twilio.com/2010-04-01/Accounts/YOUR_ACCOUNT_SID/Messages.json \
  --data-urlencode "From=+YOUR_TWILIO_NUMBER" \
  --data-urlencode "To=+17608229903" \
  --data-urlencode "Body=Test message" \
  -u YOUR_ACCOUNT_SID:YOUR_AUTH_TOKEN
```

Replace:
- `YOUR_ACCOUNT_SID` with your actual Account SID
- `YOUR_TWILIO_NUMBER` with your Twilio number (e.g., `+15551234567`)
- `YOUR_AUTH_TOKEN` with your Auth Token

### 9. Check Supabase Edge Function Logs

Ask Lovable agent to check Supabase Edge Function logs for `send-verification-code` function. Look for:
- Error messages
- "Missing Twilio credentials" warnings
- Twilio API errors

### 10. Verify Phone Number in Twilio

If using a trial account, you can only send SMS to verified phone numbers. Verify your number at:
https://console.twilio.com/us1/develop/phone-numbers/manage/verified

## Quick Checklist

- [ ] Database table `verification_codes` exists
- [ ] Twilio credentials set in Supabase Edge Functions secrets (not just Lovable env vars)
- [ ] Twilio phone number is active and verified
- [ ] Twilio account has credits
- [ ] Phone number format is correct (`+1` prefix for US numbers)
- [ ] Check browser console for errors
- [ ] Check Supabase Edge Function logs
- [ ] Check Twilio console logs

