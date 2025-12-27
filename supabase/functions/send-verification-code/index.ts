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

    console.log(`Sending verification code to ${formattedPhone}`);

    // Backend credentials
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    // Twilio credentials
    const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
    const twilioPhone = Deno.env.get("TWILIO_PHONE_NUMBER");

    if (!accountSid || !authToken || !twilioPhone) {
      console.error("Missing Twilio credentials");
      return new Response(JSON.stringify({ error: "SMS service not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!supabaseUrl || !serviceRoleKey) {
      console.error("Missing backend credentials for verification code storage");
      return new Response(JSON.stringify({ error: "Backend not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

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

    // Store code in DB (so verify-code can validate reliably)
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

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

    // Send SMS via Twilio
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

    const formData = new URLSearchParams();
    formData.append("To", formattedPhone);
    formData.append("From", twilioFromNumber);
    formData.append("Body", `Your verification code is: ${code}`);

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

    if (!twilioResponse.ok) {
      console.error("Twilio error:", twilioResult);
      return new Response(
        JSON.stringify({ error: twilioResult?.message || "Failed to send SMS" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    console.log(`Verification code sent successfully to ${formattedPhone}`);

    // Only return the code in preview/dev origins (so you can keep testing even if SMS delivery fails)
    const origin = req.headers.get("origin") ?? "";
    const isPreviewOrigin =
      origin.includes("lovableproject.com") || origin.includes("localhost");

    return new Response(
      JSON.stringify({
        success: true,
        message: "Verification code sent",
        messageSid: twilioResult?.sid ?? null,
        messageStatus: twilioResult?.status ?? null,
        ...(isPreviewOrigin ? { code } : {}),
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
