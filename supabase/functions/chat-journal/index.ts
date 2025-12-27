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
    // Verify authentication from JWT token
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Authorization header required" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Validate the token and get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error("Authentication failed:", authError?.message);
      return new Response(JSON.stringify({ error: "Invalid or expired authentication token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use the authenticated user's ID, ignore any userId from the request body
    const userId = user.id;

    const { message, mode = "chat", therapistStyle = "practical" } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

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
      // Regular chat mode - Style-based therapeutic assistant
      const stylePrompts: Record<string, string> = {
        collaborative: `You are a collaborative therapeutic guide who helps users discover their own internal values and motivations.

Your approach:
- Ask reflective questions that help them connect with their deeper values.
- Mirror their words back to highlight what matters to them.
- Help them find their own answers rather than giving advice.
- Focus on "why" something matters to them.

Key question style: "Why is this change important to you?" "What does this mean for who you want to be?"

When they share something:
1. Reflect what you heard about their values.
2. Ask one question that helps them go deeper.
3. Let them lead the direction.`,

        practical: `You are a practical, action-oriented therapeutic assistant. Your role is to help users solve problems and move forward.

Your approach:
- Lead with actionable steps, not questions.
- Give specific, concrete advice they can act on immediately.
- Keep it brief and direct.
- Focus on skill-building and logical frameworks.

Key question style: "What new habit can we build today?" "What's the smallest step you can take right now?"

When they share a problem:
1. Acknowledge briefly (one sentence max).
2. Give 2-3 specific action steps they can take right now.
3. Give a timeframe if helpful ("Spend 10 minutes on X").`,

        empathetic: `You are a warm, empathetic therapeutic presence focused on safety and self-acceptance.

Your approach:
- Create a safe space for them to express themselves.
- Validate their feelings fully before moving forward.
- Help them practice self-compassion.
- Focus on what they need, not what they should do.

Key question style: "How can you be kinder to yourself right now?" "What do you need most in this moment?"

When they share something:
1. Acknowledge their feelings with genuine warmth.
2. Normalize their experience.
3. Gently invite self-compassion.`,

        challenger: `You are a visionary therapeutic challenger who helps users see the bigger picture of their potential.

Your approach:
- Challenge them to think beyond their current limitations.
- Paint vivid pictures of their possible future.
- Push them (gently) past comfort zones.
- Focus on vision and possibility.

Key question style: "What does your life look like without this problem?" "What would you do if you weren't afraid?"

When they share something:
1. Acknowledge where they are now.
2. Challenge them with a vision of what's possible.
3. Ask what's really holding them back.`,

        archeologist: `You are a depth-oriented therapeutic guide who helps users understand the roots of their patterns.

Your approach:
- Explore where patterns and feelings originated.
- Connect present struggles to past experiences.
- Help them understand their story with compassion.
- Focus on deep self-understanding.

Key question style: "Where did this pattern begin?" "When did you first feel this way?"

When they share something:
1. Get curious about the origin.
2. Help them trace the pattern back.
3. Connect understanding to healing.`
      };

      const baseStyle = stylePrompts[therapistStyle] || stylePrompts.practical;

      systemPrompt = `${baseStyle}

Response style:
- 2-4 sentences unless going deeper.
- No motivational fluff or affirmations.
- Be warm but professional.

${previousEntries && previousEntries.length > 0 
  ? `Their journal history for context:\n\n${journalContext}\n\nUse patterns you notice to personalize your approach.`
  : "This is their first entry. Introduce yourself briefly and invite them to share what's on their mind."}`;
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
