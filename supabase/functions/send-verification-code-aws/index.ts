import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// AWS SNS SMS sender
async function sendSMSViaSNS(phoneNumber: string, message: string, accessKeyId: string, secretAccessKey: string, region: string = 'us-east-1') {
  // AWS Signature Version 4 signing
  const endpoint = `https://sns.${region}.amazonaws.com/`;
  const service = 'sns';
  const method = 'POST';
  const host = `sns.${region}.amazonaws.com`;
  const now = new Date();
  const dateStamp = now.toISOString().slice(0, 10).replace(/-/g, '');
  const amzDate = now.toISOString().replace(/[:\-]|\.\d{3}/g, '').slice(0, 15) + 'Z';

  // Create request parameters
  const params = new URLSearchParams({
    Action: 'Publish',
    PhoneNumber: phoneNumber,
    Message: message,
    Version: '2010-03-31',
  });

  // AWS Signature V4 (simplified - in production use AWS SDK)
  // For now, we'll use a simpler approach with fetch
  const url = `${endpoint}?${params.toString()}`;
  
  // Create authorization header
  const canonicalRequest = [
    method,
    `/${params.toString()}`,
    '',
    `host:${host}`,
    `x-amz-date:${amzDate}`,
    '',
    'host;x-amz-date',
    // SHA256 hash of payload (empty for GET, but we're using POST)
    'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
  ].join('\n');

  // Note: Full AWS Signature V4 is complex. 
  // For production, use AWS SDK for Deno or a simpler approach
  
  // Alternative: Use AWS SDK via npm package
  // For now, return instructions to use AWS SDK
  throw new Error('AWS SNS requires AWS SDK. See implementation guide.');
}

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

    // Clean phone number
    const cleanPhone = phone.replace(/[^\d+]/g, '');
    const formattedPhone = cleanPhone.startsWith('+') ? cleanPhone : `+1${cleanPhone}`;

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Calculate expiry
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    // Store code in database
    await supabase
      .from('verification_codes')
      .delete()
      .eq('phone', formattedPhone);

    const { error: dbError } = await supabase
      .from('verification_codes')
      .insert({
        phone: formattedPhone,
        code: code,
        expires_at: expiresAt,
        verified: false
      });

    if (dbError) {
      return new Response(
        JSON.stringify({ error: `Failed to store code: ${dbError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get AWS credentials
    const awsAccessKeyId = Deno.env.get('AWS_ACCESS_KEY_ID');
    const awsSecretAccessKey = Deno.env.get('AWS_SECRET_ACCESS_KEY');
    const awsRegion = Deno.env.get('AWS_REGION') || 'us-east-1';

    if (!awsAccessKeyId || !awsSecretAccessKey) {
      return new Response(
        JSON.stringify({ error: 'AWS credentials not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Send SMS via AWS SNS
    // Note: This requires AWS SDK. See AWS_SNS_SETUP.md for full implementation
    const message = `Your verification code is: ${code}`;
    
    // For now, return code (implement AWS SNS call)
    console.log(`📱 Would send SMS to ${formattedPhone}: ${code}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Verification code sent',
        code: code // Remove in production
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});


