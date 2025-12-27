import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function formatUsPhoneToE164(input: string): string {
  const clean = input.replace(/[^\d+]/g, "").trim();
  if (clean.startsWith("+")) return clean;
  // Default to US +1 for 10-digit inputs
  const digits = clean.replace(/\D/g, "");
  return `+1${digits}`;
}

function formatTwilioFromNumber(input: string): string {
  const trimmed = input.trim();
  if (trimmed.startsWith("+")) return trimmed;
  const digits = trimmed.replace(/\D/g, "");
  // Assume US if no + provided
  const withoutLeading1 = digits.replace(/^1/, "");
  return `+1${withoutLeading1}`;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phone } = await req.json();

    if (!phone) {
      return new Response(JSON.stringify({ error: "Phone number is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const formattedPhone = formatUsPhoneToE164(String(phone));

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAtIso = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    console.log(`📱 Verification code generated for ${formattedPhone}`);

    // Backend credentials
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      console.error("Missing backend credentials for verification code storage");
      return new Response(JSON.stringify({ error: "Backend not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Store code in DB (so verify-code can validate reliably)
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    // Clean up old codes for this phone number
    await supabase.from("verification_codes").delete().eq("phone", formattedPhone);

    const { error: insertError } = await supabase.from("verification_codes").insert({
      phone: formattedPhone,
      code,
      expires_at: expiresAtIso,
      verified: false,
    });

    if (insertError) {
      console.error("Failed to store verification code:", insertError);
      return new Response(JSON.stringify({ error: "Failed to store verification code" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Try to send SMS via Twilio (optional - if not configured, code will be shown in UI)
    const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
    const twilioPhone = Deno.env.get("TWILIO_PHONE_NUMBER");

    let smsSent = false;
    let messageSid = null;
    let messageStatus = null;

    if (accountSid && authToken && twilioPhone) {
      const twilioFromNumber = formatTwilioFromNumber(twilioPhone);

      // Basic sanity check: user didn't enter the Twilio number
      const userDigits = formattedPhone.replace(/[^\d]/g, "");
      const twilioDigits = twilioFromNumber.replace(/[^\d]/g, "");
      if (
        userDigits === twilioDigits ||
        userDigits.endsWith(twilioDigits) ||
        twilioDigits.endsWith(userDigits)
      ) {
        console.error("User entered Twilio number as their phone");
        return new Response(
          JSON.stringify({
            error: "Please enter your personal phone number, not the SMS sender number",
          }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }

      // Send SMS via Twilio
      const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

      const formData = new URLSearchParams();
      formData.append("To", formattedPhone);
      formData.append("From", twilioFromNumber);
      formData.append("Body", `Your verification code is: ${code}`);

      try {
        const twilioResponse = await fetch(twilioUrl, {
          method: "POST",
          headers: {
            Authorization: "Basic " + btoa(`${accountSid}:${authToken}`),
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: formData.toString(),
        });

        const twilioResult = await twilioResponse.json();

        console.log("📱 Twilio API Response:", {
          ok: twilioResponse.ok,
          status: twilioResult?.status,
          sid: twilioResult?.sid,
          error_code: twilioResult?.error_code,
          error_message: twilioResult?.error_message,
          to: twilioResult?.to,
          from: twilioResult?.from,
        });

        if (twilioResponse.ok) {
          smsSent = true;
          messageSid = twilioResult?.sid ?? null;
          messageStatus = twilioResult?.status ?? null;
          console.log(`✅ SMS sent via Twilio to ${formattedPhone}`);
        } else {
          console.warn("⚠️ Twilio SMS failed, code will be shown in UI instead");
        }
      } catch (error) {
        console.warn("⚠️ Twilio error, code will be shown in UI instead:", error);
      }
    } else {
      console.log("ℹ️ No Twilio credentials configured - code will be shown in UI");
    }

    console.log(`✅ Verification code generated: ${code}`);

    // Always return the code in response (user will see it in UI/toast)
    // This works immediately without any SMS provider
    return new Response(
      JSON.stringify({
        success: true,
        message: smsSent ? "Verification code sent via SMS" : "Verification code generated",
        code: code, // Always include code so user can see it
        phone: formattedPhone,
        messageSid: messageSid,
        messageStatus: messageStatus,
        smsSent: smsSent,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error: unknown) {
    console.error("Error sending verification code:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
