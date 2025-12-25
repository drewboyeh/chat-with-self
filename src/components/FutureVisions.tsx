import { useState } from "react";
import { Sparkles, Sun, Moon, X, Loader2, Bell, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { ReminderForm } from "./ReminderForm";
import { ReminderList } from "./ReminderList";

interface FutureVisionsProps {
  onClose: () => void;
}

interface Visions {
  angel: string;
  devil: string;
  reflection: string;
}

export function FutureVisions({ onClose }: FutureVisionsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [visions, setVisions] = useState<Visions | null>(null);
  const [prompt, setPrompt] = useState("");
  const [activeTab, setActiveTab] = useState<"visions" | "reminders">("visions");
  const [showReminderForm, setShowReminderForm] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const parseVisions = (content: string): Visions => {
    const angelMatch = content.match(/---ANGEL---\s*([\s\S]*?)(?=---DEVIL---|$)/i);
    const devilMatch = content.match(/---DEVIL---\s*([\s\S]*?)(?=---REFLECTION---|$)/i);
    const reflectionMatch = content.match(/---REFLECTION---\s*([\s\S]*?)$/i);

    return {
      angel: angelMatch?.[1]?.trim() || "",
      devil: devilMatch?.[1]?.trim() || "",
      reflection: reflectionMatch?.[1]?.trim() || "",
    };
  };

  const handleGetVisions = async () => {
    if (!user || !prompt.trim()) return;

    setIsLoading(true);
    setVisions(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-journal`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            message: prompt,
            userId: user.id,
            mode: "future_visions",
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get response");
      }

      // Handle streaming
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullContent = "";
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
                fullContent += content;
                // Update visions as we stream
                setVisions(parseVisions(fullContent));
              }
            } catch {
              textBuffer = line + "\n" + textBuffer;
              break;
            }
          }
        }
      }

      if (fullContent) {
        setVisions(parseVisions(fullContent));
      }
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Something went wrong",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm animate-fade-in">
      <div className="fixed inset-4 md:inset-8 lg:inset-16 bg-card rounded-2xl shadow-2xl border border-border overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-border bg-gradient-to-r from-amber-50 to-purple-50 dark:from-amber-950/20 dark:to-purple-950/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-xl">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold font-display text-foreground">Future Visions</h2>
              <p className="text-sm text-muted-foreground">See two paths ahead</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="visions">
                <Sparkles className="w-4 h-4 mr-2" />
                Future Visions
              </TabsTrigger>
              <TabsTrigger value="reminders">
                <Bell className="w-4 h-4 mr-2" />
                Reminders
              </TabsTrigger>
            </TabsList>

            <TabsContent value="visions" className="space-y-6">
              {!visions ? (
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="text-center space-y-2">
                <p className="text-muted-foreground">
                  Share the decision or crossroads you're facing, and I'll show you two possible futures based on everything I know about you.
                </p>
              </div>

              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="I'm struggling to decide whether I should..."
                className="w-full h-32 p-4 rounded-xl border border-border bg-background/50 resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-body text-foreground placeholder:text-muted-foreground"
                disabled={isLoading}
              />

              <Button
                onClick={handleGetVisions}
                disabled={isLoading || !prompt.trim()}
                className="w-full h-12 text-base font-medium"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Gazing into the future...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Reveal My Two Futures
                  </>
                )}
              </Button>
            </div>
              ) : (
            <div className="max-w-5xl mx-auto space-y-6">
              {/* Two paths side by side */}
              <div className="grid md:grid-cols-2 gap-4 md:gap-6">
                {/* Angel Path */}
                <div className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30 rounded-2xl p-5 md:p-6 border border-amber-200/50 dark:border-amber-800/50 animate-fade-in">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-full">
                      <Sun className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <h3 className="text-lg font-semibold font-display text-amber-800 dark:text-amber-200">
                      The Light Path
                    </h3>
                  </div>
                  <div className="prose prose-sm dark:prose-invert prose-amber max-w-none">
                    <p className="text-amber-900/80 dark:text-amber-100/80 whitespace-pre-wrap leading-relaxed">
                      {visions.angel || (
                        <span className="text-muted-foreground italic">Revealing...</span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Devil Path */}
                <div className="bg-gradient-to-br from-purple-50 to-slate-50 dark:from-purple-950/30 dark:to-slate-950/30 rounded-2xl p-5 md:p-6 border border-purple-200/50 dark:border-purple-800/50 animate-fade-in" style={{ animationDelay: "0.1s" }}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-full">
                      <Moon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h3 className="text-lg font-semibold font-display text-purple-800 dark:text-purple-200">
                      The Shadow Path
                    </h3>
                  </div>
                  <div className="prose prose-sm dark:prose-invert prose-purple max-w-none">
                    <p className="text-purple-900/80 dark:text-purple-100/80 whitespace-pre-wrap leading-relaxed">
                      {visions.devil || (
                        <span className="text-muted-foreground italic">Revealing...</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Reflection */}
              {visions.reflection && (
                <div className="bg-gradient-to-r from-primary/5 to-purple-500/5 rounded-xl p-5 border border-primary/10 text-center animate-fade-in" style={{ animationDelay: "0.2s" }}>
                  <p className="text-foreground/80 italic font-body">
                    "{visions.reflection}"
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-center gap-3 pt-4">
                <Button variant="outline" onClick={() => setVisions(null)}>
                  Ask About Another Decision
                </Button>
                <Button onClick={onClose}>
                  Return to Journal
                </Button>
              </div>
            </div>
              )}
            </TabsContent>

            <TabsContent value="reminders" className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Your Reminders</h3>
                <Button
                  onClick={() => setShowReminderForm(!showReminderForm)}
                  size="sm"
                  variant={showReminderForm ? "outline" : "default"}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {showReminderForm ? "Cancel" : "New Reminder"}
                </Button>
              </div>

              {showReminderForm ? (
                <div className="bg-card border border-border rounded-lg p-6">
                  <ReminderForm
                    onSuccess={() => {
                      setShowReminderForm(false);
                      toast({
                        title: "Reminder created!",
                        description: "You'll be notified when it's time.",
                      });
                    }}
                    onCancel={() => setShowReminderForm(false)}
                  />
                </div>
              ) : (
                <ReminderList />
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}