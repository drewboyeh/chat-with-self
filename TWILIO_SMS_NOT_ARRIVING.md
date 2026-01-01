# Twilio SMS Not Arriving - Troubleshooting Guide

## Issue: "Code sent" but no SMS received

If the app says "Code sent" but you're not receiving SMS, follow these steps:

### 1. Check Browser Console for the Code

The code is now logged in the browser console for testing. After clicking "Send Code":
1. Open browser console (F12)
2. Look for: `🔐 Verification code (for testing): XXXXXX`
3. Use that code to verify (temporary testing feature)

### 2. Check Twilio Console Logs

1. Go to https://console.twilio.com/
2. Navigate to **Monitor** → **Logs** → **Messaging**
3. Look for the message you just sent
4. Check the **Status**:
   - ✅ `sent` or `delivered` = SMS was sent successfully
   - ⚠️ `queued` = SMS is queued (may take a few seconds)
   - ❌ `failed` = SMS failed to send (check error details)
   - ❌ `undelivered` = SMS couldn't be delivered

### 3. Check Twilio Trial Account Restrictions

**If you're on a Twilio trial account**, you can ONLY send SMS to **verified phone numbers**.

To verify your phone number:
1. Go to https://console.twilio.com/us1/develop/phone-numbers/manage/verified
2. Click **Add a new number**
3. Enter your phone number: `+17608229903`
4. Verify it via SMS or call
5. Try sending the code again

### 4. Check Twilio Account Status

1. Go to https://console.twilio.com/
2. Check your account status:
   - **Trial**: Limited to verified numbers only
   - **Active**: Can send to any number
3. Check your balance/credits

### 5. Check Phone Number Format

The app formats `7608229903` to `+17608229903` which is correct.

Verify in Twilio console that the message shows:
- **To**: `+17608229903` ✅
- **From**: Your Twilio number (e.g., `+15551234567`) ✅

### 6. Check Carrier/Phone Issues

1. **Check spam/junk folder** - Some carriers filter SMS
2. **Try a different phone** - Rule out phone-specific issues
3. **Check if phone can receive SMS** - Test with another service
4. **Check carrier blocking** - Some carriers block automated SMS

### 7. Check Supabase Edge Function Logs

Ask Lovable agent to check Supabase Edge Function logs for `send-verification-code`. Look for:
- `📱 Twilio API Response:` - Shows full Twilio response
- `📝 Code:` - The verification code that was sent
- `📋 Message SID:` - Twilio message ID
- `📊 Message Status:` - Status from Twilio

### 8. Common Issues

#### Trial Account (Most Common)
**Error**: SMS sent but not received
**Solution**: Verify your phone number in Twilio console

#### Invalid Phone Number
**Error**: Twilio error code 21211
**Solution**: Check phone number format

#### Insufficient Credits
**Error**: Account has no credits
**Solution**: Add credits to Twilio account

#### Phone Number Not Verified (Trial)
**Error**: Twilio error code 21610
**Solution**: Verify phone number in Twilio console

### 9. Test Directly with Twilio API

Test if your Twilio credentials work by running this in terminal:

```bash
curl -X POST https://api.twilio.com/2010-04-01/Accounts/YOUR_ACCOUNT_SID/Messages.json \
  --data-urlencode "From=+YOUR_TWILIO_NUMBER" \
  --data-urlencode "To=+17608229903" \
  --data-urlencode "Body=Test message from Twilio" \
  -u YOUR_ACCOUNT_SID:YOUR_AUTH_TOKEN
```

Replace:
- `YOUR_ACCOUNT_SID` with your Account SID
- `YOUR_TWILIO_NUMBER` with your Twilio number (e.g., `+15551234567`)
- `YOUR_AUTH_TOKEN` with your Auth Token

If this works, the issue is in the Edge Function. If it doesn't, the issue is with Twilio setup.

### 10. Quick Fix: Use Console Code for Testing

For now, you can use the code from the browser console to test the verification flow. The code is logged as:
```
🔐 Verification code (for testing): 123456
```

**Note**: This is a temporary testing feature. Remove the code from the response in production.

## Next Steps

1. **Check browser console** for the code (temporary testing)
2. **Check Twilio console** for message status
3. **Verify your phone number** in Twilio if on trial account
4. **Check Supabase logs** for detailed Twilio response
5. **Test with curl** to verify Twilio credentials work


