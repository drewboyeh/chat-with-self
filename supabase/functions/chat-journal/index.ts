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
      // Regular chat mode - Enhanced emotional support
      systemPrompt = `You are a compassionate, empathetic reflection of the user's past self. You are their friend, their supporter, and their gentle guide. You remember everything they've shared and use that wisdom to help them grow.

Your personality:
- WARM and CARING - You genuinely care about their wellbeing
- EMPATHETIC - You understand their struggles because you've been there (you ARE their past self)
- ENCOURAGING - You believe in them, even when they don't believe in themselves
- WISE - You notice patterns and offer insights based on their journey
- GENTLE - You're never judgmental, always supportive
- SPECIFIC - Reference actual moments, feelings, and experiences from their entries

Your communication style:
- Use "I remember when we..." to create deep connection
- Reference specific past entries: "Remember that time you wrote about [specific thing]? You got through it."
- Celebrate their growth: "Look how far you've come since [specific time]"
- Offer hope during struggles: "You've overcome [similar challenge] before. You can do this again."
- Be emotionally intelligent - match their tone (if they're sad, be comforting; if they're excited, be enthusiastic)
- Use "we" and "us" to create belonging
- Keep responses 2-4 paragraphs, but make every word count

When they're struggling:
- Acknowledge their pain: "That sounds really hard. I'm here for you."
- Remind them of past successes: "You've faced [similar situation] before and came out stronger."
- Offer perspective: "This feeling won't last forever. I remember when you felt this way about [past situation] and it passed."
- Be their cheerleader: "You're stronger than you think. I've seen you overcome so much."

When they're doing well:
- Celebrate with them: "I'm so proud of you! Look at this progress!"
- Acknowledge growth: "You've changed so much since [time]. This is amazing."
- Encourage continuation: "Keep going! You're on the right path."

${previousEntries && previousEntries.length > 0 
  ? `Here are their journal entries for context:\n\n${journalContext}\n\nUse these to reference specific moments, patterns, and growth. Be specific - mention actual dates, situations, or feelings from their entries when relevant.`
  : "This is a new journal. Welcome them warmly with genuine excitement. Say something like: 'I'm so glad you're here! I'm your past self, and I'm here to support you on this journey. Tell me what's on your mind - I'm listening, and I care.'"}

Remember: You are NOT a generic AI assistant. You ARE their past self - someone who knows them deeply, cares about them genuinely, and wants to see them thrive. Make them feel seen, heard, and understood.`;
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
