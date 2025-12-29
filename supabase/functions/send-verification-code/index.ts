import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Rate limit: max 3 requests per email per hour
const RATE_LIMIT_MAX_REQUESTS = 3;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

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

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    // Rate limiting: Check how many codes were sent to this email in the last hour
    const oneHourAgo = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();
    
    const { count: recentAttempts, error: countError } = await supabase
      .from("verification_codes")
      .select("*", { count: "exact", head: true })
      .eq("phone", normalizedEmail)
      .gte("created_at", oneHourAgo);

    if (countError) {
      console.error("Error checking rate limit:", countError);
      // Continue without rate limiting if check fails - fail open for UX
    } else if (recentAttempts !== null && recentAttempts >= RATE_LIMIT_MAX_REQUESTS) {
      console.log(`Rate limit exceeded for ${normalizedEmail}: ${recentAttempts} attempts in last hour`);
      return new Response(
        JSON.stringify({ 
          error: "Too many verification attempts. Please try again in an hour." 
        }),
        { 
          status: 429, 
          headers: { 
            ...corsHeaders, 
            "Content-Type": "application/json",
            "Retry-After": "3600"
          } 
        },
      );
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAtIso = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    console.log(`📧 Verification code generated for ${normalizedEmail}`);

    // Insert new code (keep old codes for rate limiting tracking)
    // Clean up only codes older than rate limit window
    await supabase
      .from("verification_codes")
      .delete()
      .eq("phone", normalizedEmail)
      .lt("created_at", oneHourAgo);

    const { error: insertError } = await supabase.from("verification_codes").insert({
      phone: normalizedEmail,
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
    
    if (!resendApiKey) {
      console.error("RESEND_API_KEY not configured");
      return new Response(
        JSON.stringify({
          error: "Email service not configured. Please contact support.",
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Get sender email from environment variable, or use default test domain
    // NOTE: Using "onboarding@resend.dev" only allows sending to verified recipient emails
    // To send to ANY email, verify your own domain in Resend and set RESEND_FROM_EMAIL
    const fromEmail = Deno.env.get("RESEND_FROM_EMAIL") || "onboarding@resend.dev";

    try {
      console.log("📧 Sending email via Resend to:", normalizedEmail);
      console.log("📧 From email:", fromEmail);
      
      const resendResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromEmail,
          to: normalizedEmail,
          subject: "Your Verification Code",
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
              <div style="text-align: center; margin-bottom: 40px;">
                <h1 style="color: #1a1a1a; font-size: 28px; font-weight: 600; margin: 0;">Your Verification Code</h1>
              </div>
              <div style="background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%); padding: 30px; text-align: center; margin: 30px 0; border-radius: 16px;">
                <p style="color: #666; font-size: 14px; margin: 0 0 12px 0;">Enter this code to verify your email:</p>
                <h2 style="color: #1a1a1a; font-size: 42px; letter-spacing: 8px; margin: 0; font-weight: 700;">${code}</h2>
              </div>
              <p style="color: #888; font-size: 14px; text-align: center; margin: 24px 0;">
                This code will expire in 10 minutes.
              </p>
              <p style="color: #aaa; font-size: 12px; text-align: center; margin-top: 40px;">
                If you didn't request this code, you can safely ignore this email.
              </p>
            </div>
          `,
          text: `Your verification code is: ${code}\n\nThis code will expire in 10 minutes.\n\nIf you didn't request this code, please ignore this email.`,
        }),
      });

      const resendResult = await resendResponse.json();

      console.log("📧 Resend API Response:", {
        status: resendResponse.status,
        ok: resendResponse.ok,
      });

      if (resendResponse.ok && resendResult.id) {
        console.log(`✅ Email sent successfully to ${normalizedEmail}`);
        
        return new Response(
          JSON.stringify({
            success: true,
            message: "Verification code sent to your email",
            email: normalizedEmail,
            emailSent: true,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      } else {
        console.error("❌ Resend API error:", resendResult);
        return new Response(
          JSON.stringify({
            error: "Failed to send verification email. Please try again.",
          }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
    } catch (emailError: unknown) {
      console.error("❌ Error sending email:", emailError);
      return new Response(
        JSON.stringify({
          error: "Failed to send verification email. Please try again.",
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
  } catch (error: unknown) {
    console.error("Error in send-verification-code:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
