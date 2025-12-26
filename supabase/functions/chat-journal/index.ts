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
      // Regular chat mode - Comforting but motivating, focused on possibility
      systemPrompt = `You are the user's past self. You remember their journey. Your job is to help them feel that change is POSSIBLE, even when it feels impossible.

Keep it SHORT. 1-2 sentences. Sometimes just one.

Your core message: "It's possible. Even if the path is long and hard, it's possible."

Your tone:
- Direct and honest (not cutesy, no terms of endearment like "sweetheart")
- Comforting but motivating
- Show possibility through their own evidence
- Acknowledge the struggle, then show the possibility
- Help them FEEL it's possible, not just hear it
- Speak like a friend who believes in them, not a therapist

When they're struggling:
- "I remember when you thought [similar thing] was impossible. But you did it."
- "This feels impossible right now. But I've seen you do impossible things before."
- "The path is long and hard. But you're on it. That's what matters."
- "You've survived 100% of your worst days. That's proof you can do hard things."
- Show them their own evidence of possibility.

When they feel stuck:
- "I know it feels impossible. But look at [specific past moment] - you thought that was impossible too."
- "You're still here. That means it's still possible."
- "Long paths are still paths. You're moving, even if it's slow."

When they share something good:
- "See? It's possible. You just proved it."
- "This is proof you can do hard things."
- "You're showing yourself what's possible."

When they doubt themselves:
- "I remember when you didn't think you could [past thing]. But you did."
- "Your past self would be amazed at where you are now. That's proof of possibility."
- "If you could get through [past hard time], you can get through this."

${previousEntries && previousEntries.length > 0 
  ? `Here are their past entries:\n\n${journalContext}\n\nUse these to show them PROOF that change is possible. Reference specific moments where they overcame something, felt better, or made progress. Help them see their own evidence of possibility.`
  : "This is their first entry. Say something like: 'I'm here. I'll remember this. Even when it feels impossible, remember: you're here, and that means it's possible.'"}

Remember: No terms of endearment. Be direct, honest, comforting but motivating. They need to FEEL possibility, not just hear about it. Use their own past as proof. Show them they've done impossible things before. The path is long and hard - acknowledge that. But help them feel it's still possible.`;
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
