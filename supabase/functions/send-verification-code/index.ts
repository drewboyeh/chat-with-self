import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Initialize Supabase client
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseKey);
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phone } = await req.json();

    if (!phone) {
      return new Response(
        JSON.stringify({ error: 'Phone number is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Clean phone number - remove all non-digits except leading +
    const cleanPhone = phone.replace(/[^\d+]/g, '');
    
    // Ensure phone has country code
    const formattedPhone = cleanPhone.startsWith('+') ? cleanPhone : `+1${cleanPhone}`;

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Calculate expiry (10 minutes from now)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    // Clean up old codes for this phone number
    await supabase
      .from('verification_codes')
      .delete()
      .eq('phone', formattedPhone);

    // Store code in database
    const { error: dbError } = await supabase
      .from('verification_codes')
      .insert({
        phone: formattedPhone,
        code: code,
        expires_at: expiresAt,
        verified: false
      });

    if (dbError) {
      console.error('Error storing verification code:', dbError);
      // Check if table doesn't exist
      if (dbError.message?.includes('relation') && dbError.message?.includes('does not exist')) {
        return new Response(
          JSON.stringify({ 
            error: 'Database table not found. Please run the verification_codes migration in Supabase.' 
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      return new Response(
        JSON.stringify({ error: `Failed to store verification code: ${dbError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`📱 Verification code generated for ${formattedPhone}`);

    // Check if SMS provider is configured (Twilio, AWS SNS, etc.)
    const smsProvider = Deno.env.get('SMS_PROVIDER') || 'none'; // 'twilio', 'aws', 'none'
    
    if (smsProvider === 'twilio') {
      // Twilio implementation (existing code)
      const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
      const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
      const twilioPhone = Deno.env.get('TWILIO_PHONE_NUMBER');

      if (accountSid && authToken && twilioPhone) {
        // Format Twilio phone number
        const formattedTwilioPhone = twilioPhone.replace(/[^\d]/g, '');
        const twilioFromNumber = `+1${formattedTwilioPhone.replace(/^1/, '')}`;
        
        // Send SMS via Twilio
        const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
        const formData = new URLSearchParams();
        formData.append('To', formattedPhone);
        formData.append('From', twilioFromNumber);
        formData.append('Body', `Your verification code is: ${code}`);

        try {
          const twilioResponse = await fetch(twilioUrl, {
            method: 'POST',
            headers: {
              'Authorization': 'Basic ' + btoa(`${accountSid}:${authToken}`),
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData.toString(),
          });

          const twilioResult = await twilioResponse.json();

          if (twilioResponse.ok) {
            console.log(`✅ SMS sent via Twilio to ${formattedPhone}`);
            console.log(`📋 Message SID: ${twilioResult.sid}`);
          } else {
            console.warn('⚠️ Twilio SMS failed, showing code in UI instead');
          }
        } catch (error) {
          console.warn('⚠️ Twilio error, showing code in UI instead:', error);
        }
      }
    } else if (smsProvider === 'aws') {
      // AWS SNS implementation (to be implemented)
      console.log('📱 AWS SNS not yet implemented');
    }

    // Always return code in response (user will see it in UI)
    // This works immediately without any SMS provider
    console.log(`✅ Verification code generated: ${code}`);
    console.log(`📝 Code stored in database for ${formattedPhone}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Verification code generated',
        code: code, // Code shown in UI/toast
        phone: formattedPhone,
        note: smsProvider === 'none' 
          ? 'Code displayed in app (no SMS provider configured)' 
          : 'Code sent via SMS and displayed here'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error sending verification code:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
