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
  const digits = clean.replace(/\D/g, "");
  return `+1${digits}`;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phone, code } = await req.json();

    if (!phone || !code) {
      return new Response(JSON.stringify({ error: "Phone number and code are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const formattedPhone = formatUsPhoneToE164(String(phone));
    const enteredCode = String(code).trim();

    console.log(`Verifying code for ${formattedPhone}`);

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      console.error("Missing backend credentials");
      return new Response(JSON.stringify({ error: "Backend not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    const { data: rows, error: selectError } = await supabase
      .from("verification_codes")
      .select("id, code, expires_at, verified, created_at")
      .eq("phone", formattedPhone)
      .order("created_at", { ascending: false })
      .limit(1);

    if (selectError) {
      console.error("Error loading verification code:", selectError);
      return new Response(JSON.stringify({ error: "Failed to load verification code" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const row = rows?.[0];
    if (!row) {
      return new Response(
        JSON.stringify({ error: "No verification code found. Please request a new one." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (row.verified) {
      return new Response(JSON.stringify({ error: "This code was already used. Request a new one." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const expiresAtMs = new Date(row.expires_at).getTime();
    if (Date.now() > expiresAtMs) {
      return new Response(
        JSON.stringify({ error: "Verification code expired. Please request a new one." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (row.code !== enteredCode) {
      return new Response(JSON.stringify({ error: "Invalid verification code" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { error: updateError } = await supabase
      .from("verification_codes")
      .update({ verified: true })
      .eq("id", row.id);

    if (updateError) {
      console.error("Error marking code verified:", updateError);
      return new Response(JSON.stringify({ error: "Failed to verify code" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Phone ${formattedPhone} verified successfully`);

    return new Response(JSON.stringify({ success: true, verified: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Error verifying code:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
