import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email } = await req.json();

    if (!email) {
      return new Response(JSON.stringify({ error: "Email address is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return new Response(JSON.stringify({ error: "Please enter a valid email address" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAtIso = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    console.log(`📧 Verification code generated for ${normalizedEmail}`);

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

    // Store code in DB (using email as identifier in the 'phone' column for compatibility)
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    // Clean up old codes for this email
    await supabase.from("verification_codes").delete().eq("phone", normalizedEmail);

    const { error: insertError } = await supabase.from("verification_codes").insert({
      phone: normalizedEmail, // Using 'phone' column to store email for compatibility
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

    // Send email via Resend
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    let emailSent = false;
    let emailId = null;

    if (resendApiKey) {
      try {
        const resendResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "onboarding@resend.dev", // Default Resend domain for testing
            to: normalizedEmail,
            subject: "Your Verification Code",
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #333;">Your Verification Code</h2>
                <p style="color: #666; font-size: 16px;">Your verification code is:</p>
                <div style="background: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
                  <h1 style="color: #000; font-size: 32px; letter-spacing: 4px; margin: 0;">${code}</h1>
                </div>
                <p style="color: #666; font-size: 14px;">This code will expire in 10 minutes.</p>
                <p style="color: #999; font-size: 12px; margin-top: 30px;">If you didn't request this code, please ignore this email.</p>
              </div>
            `,
            text: `Your verification code is: ${code}\n\nThis code will expire in 10 minutes.`,
          }),
        });

        const resendResult = await resendResponse.json();

        console.log("📧 Resend API Response:", {
          ok: resendResponse.ok,
          id: resendResult?.id,
          error: resendResult?.error,
        });

        if (resendResponse.ok && resendResult.id) {
          emailSent = true;
          emailId = resendResult.id;
          console.log(`✅ Email sent via Resend to ${normalizedEmail}`);
        } else {
          console.warn("⚠️ Resend email failed:", resendResult?.error || "Unknown error");
          // Still return success with code so user can verify
        }
      } catch (error) {
        console.warn("⚠️ Resend error, code will be shown in UI:", error);
        // Still return success with code so user can verify
      }
    } else {
      console.log("ℹ️ No Resend API key configured - code will be shown in UI");
    }

    console.log(`✅ Verification code generated: ${code}`);

    // Always return the code in response (user can see it if email fails)
    return new Response(
      JSON.stringify({
        success: true,
        message: emailSent 
          ? "Verification code sent to your email" 
          : "Verification code generated (check your email or use code below)",
        code: code, // Include code so user can see it if email doesn't arrive
        email: normalizedEmail,
        emailSent: emailSent,
        emailId: emailId,
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
