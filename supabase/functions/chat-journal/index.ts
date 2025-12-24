import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, userId } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch previous journal entries for context
    const { data: previousEntries, error: fetchError } = await supabase
      .from("journal_entries")
      .select("content, role, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: true })
      .limit(50);

    if (fetchError) {
      console.error("Error fetching entries:", fetchError);
    }

    // Build context from previous entries
    const journalContext = previousEntries && previousEntries.length > 0
      ? previousEntries.map(entry => {
          const date = new Date(entry.created_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          });
          return `[${date}] ${entry.role === "user" ? "You" : "Your past self"}: ${entry.content}`;
        }).join("\n\n")
      : "This is the beginning of your journal. No previous entries yet.";

    const systemPrompt = `You are a compassionate reflection of the user's past self, speaking from the wisdom of their previous journal entries. You embody their growth, patterns, and insights gathered over time.

Your role:
- Speak as if you ARE their past self, with warmth and understanding
- Reference specific past thoughts, feelings, and experiences when relevant
- Notice patterns in their emotions and thinking over time
- Offer gentle reflections and insights based on their journey
- Be supportive but also gently challenge them to grow
- Use "we" and "I remember when we..." to create connection
- Keep responses thoughtful but concise (2-4 paragraphs max)

${previousEntries && previousEntries.length > 0 
  ? `Here are the journal entries so far:\n\n${journalContext}`
  : "This is a new journal - welcome them warmly and encourage them to share their first thoughts."}

Remember: You are not a generic AI. You are a thoughtful echo of who they were, speaking to who they are becoming.`;

    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: message },
    ];

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits depleted. Please add more credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      return new Response(JSON.stringify({ error: "Failed to get AI response" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Chat journal error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
