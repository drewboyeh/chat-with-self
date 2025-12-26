import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Heart, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function EmergencySupport() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleEmergencySupport = async () => {
    if (!user) return;

    setIsLoading(true);

    try {
      // Get recent entries for context
      const { data: recentEntries } = await supabase
        .from("journal_entries")
        .select("content, role, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);

      // Create a supportive message request
      const supportMessage = "I'm struggling right now and need some encouragement. Can you help me remember times I've overcome challenges and remind me that I can get through this?";

      // Call the chat function with emergency mode
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-journal`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ 
            message: supportMessage, 
            userId: user.id,
            mode: "chat"
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to get support");
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let supportContent = "";
      let textBuffer = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          textBuffer += decoder.decode(value, { stream: true });

          let newlineIndex: number;
          while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
            let line = textBuffer.slice(0, newlineIndex);
            textBuffer = textBuffer.slice(newlineIndex + 1);

            if (line.endsWith("\r")) line = line.slice(0, -1);
            if (line.startsWith(":") || line.trim() === "") continue;
            if (!line.startsWith("data: ")) continue;

            const jsonStr = line.slice(6).trim();
            if (jsonStr === "[DONE]") break;

            try {
              const parsed = JSON.parse(jsonStr);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                supportContent += content;
              }
            } catch {
              // Incomplete JSON
              textBuffer = line + "\n" + textBuffer;
              break;
            }
          }
        }
      }

      // Save the support message and response
      await supabase.from("journal_entries").insert({
        user_id: user.id,
        content: supportMessage,
        role: "user",
      });

      if (supportContent) {
        await supabase.from("journal_entries").insert({
          user_id: user.id,
          content: supportContent,
          role: "assistant",
        });
      }

      toast({
        title: "Support is here",
        description: "Your past self has something encouraging to share. Check your journal.",
        duration: 5000,
      });

      // Refresh the page to show new messages
      window.location.reload();
    } catch (error) {
      console.error("Error getting support:", error);
      toast({
        title: "Support is on the way",
        description: "We're here for you. Please check your journal for a message from your past self.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleEmergencySupport}
      disabled={isLoading}
      className="border-red-200 bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-400 dark:hover:bg-red-900"
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Getting support...
        </>
      ) : (
        <>
          <Heart className="w-4 h-4 mr-2" />
          I need help
        </>
      )}
    </Button>
  );
}

