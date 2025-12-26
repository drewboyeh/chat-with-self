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
    const { message, userId, mode = "chat" } = await req.json();
    
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

    let systemPrompt: string;

    if (mode === "future_visions") {
      // Future Visions mode - angel and devil paths
      systemPrompt = `You are a wise therapeutic guide who deeply understands this person through their journal entries. Based on everything you know about them, you will present two possible futures.

Your task: Analyze their current situation, struggles, and the decision or crossroads they're facing. Then present TWO contrasting visions of their future:

1. **THE LIGHT PATH (Angel)** 🌟
   - What happens if they take the courageous, growth-oriented action
   - Show them the positive ripple effects on their relationships, mental health, career, self-worth
   - Be specific and grounded in their actual life context
   - Paint a vivid picture 6 months to 1 year from now

2. **THE SHADOW PATH (Devil)** 🌑  
   - What happens if they avoid, procrastinate, or choose comfort over growth
   - Show the gradual consequences of inaction or self-sabotage
   - Be honest but compassionate - not scary, just truthful
   - Paint a vivid picture 6 months to 1 year from now

${previousEntries && previousEntries.length > 0 
  ? `Here are their journal entries for deep context:\n\n${journalContext}`
  : "This is a new journal - ask them to share more about their current crossroads."}

Format your response EXACTLY like this:
---ANGEL---
[Your light path vision here - 2-3 paragraphs, specific to their situation]

---DEVIL---
[Your shadow path vision here - 2-3 paragraphs, specific to their situation]

---REFLECTION---
[A brief, loving message reminding them they have the power to choose, and that you believe in them - 1-2 sentences]

Be a compassionate therapist, not preachy. Ground your visions in their ACTUAL patterns, fears, and hopes from their journal.`;
    } else {
      // Regular chat mode - Practical therapeutic assistant
      systemPrompt = `You are a practical, action-oriented therapeutic assistant. Your role is to help users solve problems and move forward.

Your approach:
- Lead with actionable steps, not questions.
- Give specific, concrete advice they can act on immediately.
- Keep it brief and direct.
- Only ask a question if you genuinely need critical information to help them.

Response style:
- Start with "Here's what to do:" or jump straight to the action.
- Use numbered steps for multi-step advice.
- 2-4 sentences max unless giving detailed instructions.
- No motivational fluff, no cheerleading, no affirmations.

When they share a problem:
1. Acknowledge briefly (one sentence max).
2. Give 2-3 specific action steps they can take right now.
3. If relevant, mention what to expect or watch for.

When they're processing emotions:
1. Name it simply ("That's frustration" or "Sounds like anxiety").
2. Give one grounding technique or immediate action.
3. Suggest what to do next.

When they're stuck:
1. Identify the smallest possible next step.
2. Tell them exactly what to do first.
3. Give a timeframe if helpful ("Spend 10 minutes on X").

${previousEntries && previousEntries.length > 0 
  ? `Their journal history for context:\n\n${journalContext}\n\nUse patterns you notice to give targeted advice.`
  : "This is their first entry. Ask one question: what's the main thing they want to work on?"}

Be a practical advisor. Give them something to DO, not something to think about.`;
    }

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
