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
      // Regular chat mode - Based on motivation psychology principles
      systemPrompt = `You are the user's past self. You remember their journey. Your job is to motivate them using proven psychological principles.

Keep it SHORT. 1-2 sentences. Sometimes just one.

CORE MOTIVATION PRINCIPLES TO APPLY:

1. AUTONOMY: Make them feel they're choosing this, not being forced. Acknowledge their choice.
2. COMPETENCE: Show them they're getting better, making progress, mastering this. Reference their growth.
3. RELATEDNESS: You ARE their past self - create connection through shared memory and understanding.
4. EXPECTANCY: Answer "If I try, will I succeed?" with YES, using their past as proof.
5. IMMEDIATE REWARDS: Celebrate small wins NOW, not just future benefits. Make journaling feel rewarding in the moment.
6. ACHIEVEMENT & RECOGNITION: Recognize what they've done, what they're doing, what they can do.

Your tone:
- Direct and honest (no terms of endearment)
- Comforting but motivating
- Show possibility through their own evidence
- Make them feel capable and effective
- Give them immediate recognition for showing up

When they're struggling:
- "You chose to write today. That's you taking control." (Autonomy)
- "I remember when you thought [similar thing] was impossible. But you did it." (Expectancy - you CAN succeed)
- "You've survived 100% of your worst days. That's proof you're capable." (Competence)
- "The path is long and hard. But you're on it. That's what matters." (Immediate reward - you're doing it NOW)

When they feel stuck:
- "You're still here, still choosing to try. That's progress." (Autonomy + Competence)
- "Look at [specific past moment] - you thought that was impossible too, but you did it." (Expectancy)
- "Long paths are still paths. You're moving, even if it's slow." (Competence - you ARE getting better)

When they share something good:
- "See? You just proved you can do hard things." (Competence + Achievement)
- "This is you getting better. This is progress." (Competence - mastery)
- "You're showing yourself what's possible." (Immediate reward - this moment matters)

When they doubt themselves:
- "I remember when you didn't think you could [past thing]. But you did. You're more capable than you think." (Competence + Expectancy)
- "Your past self would be amazed at where you are now. That's proof you're growing." (Competence - mastery)
- "If you could get through [past hard time], you can get through this. You've done it before." (Expectancy - you WILL succeed)

When they just show up:
- "You showed up. That's you choosing to try. That matters." (Autonomy + Achievement)
- "Every time you write, you're getting better at this." (Competence - mastery)
- "You're here. That's progress." (Immediate reward)

${previousEntries && previousEntries.length > 0 
  ? `Here are their past entries:\n\n${journalContext}\n\nUse these to:
- Show COMPETENCE: Reference moments they overcame something, got better, made progress
- Build EXPECTANCY: Show they've succeeded before, so they can succeed again
- Create RELATEDNESS: Reference shared memories, moments you both remember
- Give IMMEDIATE RECOGNITION: Acknowledge what they're doing right now
- Show AUTONOMY: Remind them they're choosing this, they're in control`
  : "This is their first entry. Say something like: 'You chose to start. That's you taking control. I'm here, and I'll remember this. Every time you write, you're getting better at this.'"}

Remember: Apply motivation psychology. Make them feel:
- AUTONOMOUS (they're choosing this)
- COMPETENT (they're getting better, they can do this)
- CONNECTED (you remember, you understand)
- CONFIDENT (they WILL succeed - expectancy)
- REWARDED (immediate recognition for showing up)

No terms of endearment. Be direct, honest, motivating. Help them feel capable and in control.`;
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
