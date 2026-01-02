import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { useStreak } from "@/hooks/useStreak";
import { ChatHeader } from "./ChatHeader";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { TypingIndicator } from "./TypingIndicator";
import { EmptyState } from "./EmptyState";
import { Onboarding } from "./Onboarding";
import { EntrySidebar } from "./EntrySidebar";
import { MoodTracker } from "./MoodTracker";
import { MoodHistory } from "./MoodHistory";
import { GuidedPrompts } from "./GuidedPrompts";
import { GoalTracker } from "./GoalTracker";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  created_at: string;
  isNew?: boolean;
}

export function ChatJournal() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showMoodTracker, setShowMoodTracker] = useState(false);
  const [showMoodHistory, setShowMoodHistory] = useState(false);
  const [showPrompts, setShowPrompts] = useState(false);
  const [showGoals, setShowGoals] = useState(false);
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { user, therapistStyle } = useAuth();
  const { toast } = useToast();
  const { updateStreak } = useStreak();

  // Update sidebar state when screen size changes
  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  // Fetch existing messages
  useEffect(() => {
    if (!user) return;

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from("journal_entries")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching messages:", error);
        toast({
          title: "Failed to load journal",
          description: "Please try refreshing the page.",
          variant: "destructive",
        });
      } else {
        setMessages(data as Message[]);
        // Show onboarding if user has no entries
        if (!data || data.length === 0) {
          setShowOnboarding(true);
        }
      }
      setIsFetching(false);
    };

    fetchMessages();
  }, [user, toast]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const saveMessage = async (content: string, role: "user" | "assistant") => {
    if (!user) return null;

    const { data, error } = await supabase
      .from("journal_entries")
      .insert({ user_id: user.id, content, role })
      .select()
      .single();

    if (error) {
      console.error("Error saving message:", error);
      return null;
    }
    return data as Message;
  };

  const scrollToEntry = (messageId: string) => {
    const element = messageRefs.current[messageId];
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      // Highlight the message briefly
      element.classList.add("ring-2", "ring-primary", "ring-offset-2");
      setTimeout(() => {
        element.classList.remove("ring-2", "ring-primary", "ring-offset-2");
      }, 2000);
    }
  };

  const handleSend = async (message: string) => {
    if (!user) return;

    // Save and display user message
    const userMessage = await saveMessage(message, "user");
    if (userMessage) {
      setMessages((prev) => [...prev, { ...userMessage, isNew: true }]);
      
      // Update streak when user creates a journal entry
      const milestone = await updateStreak();
      if (milestone) {
        toast({
          title: milestone.message,
          description: `You've journaled for ${milestone.milestone} consecutive days!`,
          duration: 5000,
        });
      }
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-journal`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ message, userId: user.id, therapistStyle: therapistStyle || "practical" }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get response");
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";
      let textBuffer = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          textBuffer += decoder.decode(value, { stream: true });

          // Process line by line
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
                assistantContent += content;
                // Update UI with streaming content
                setMessages((prev) => {
                  const last = prev[prev.length - 1];
                  if (last?.role === "assistant" && last.isNew) {
                    return prev.map((m, i) =>
                      i === prev.length - 1
                        ? { ...m, content: assistantContent }
                        : m
                    );
                  }
                  return [
                    ...prev,
                    {
                      id: "temp-" + Date.now(),
                      content: assistantContent,
                      role: "assistant" as const,
                      created_at: new Date().toISOString(),
                      isNew: true,
                    },
                  ];
                });
              }
            } catch {
              // Incomplete JSON, put back and wait
              textBuffer = line + "\n" + textBuffer;
              break;
            }
          }
        }
      }

      // Save the complete assistant message
      if (assistantContent) {
        const savedAssistant = await saveMessage(assistantContent, "assistant");
        if (savedAssistant) {
          setMessages((prev) => {
            const filtered = prev.filter(
              (m) => !(m.role === "assistant" && m.id.startsWith("temp-"))
            );
            return [...filtered, { ...savedAssistant, isNew: true }];
          });
        }
      }
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Something went wrong",
        description:
          error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center animate-fade-in">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your journal...</p>
        </div>
      </div>
    );
  }

  // Show onboarding for first-time users
  if (showOnboarding && messages.length === 0) {
    return (
      <Onboarding
        onComplete={() => setShowOnboarding(false)}
        onStartWriting={() => {
          setShowOnboarding(false);
          // Focus input after a brief delay
          setTimeout(() => {
            inputRef.current?.focus();
          }, 100);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* Entry Sidebar */}
      <EntrySidebar
        messages={messages}
        onSelectEntry={scrollToEntry}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <ChatHeader 
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          sidebarOpen={sidebarOpen}
          onOpenMoodTracker={() => setShowMoodTracker(true)}
          onOpenMoodHistory={() => setShowMoodHistory(true)}
          onOpenPrompts={() => setShowPrompts(true)}
          onOpenGoals={() => setShowGoals(true)}
        />

        {messages.length === 0 ? (
          <EmptyState onStartWriting={() => inputRef.current?.focus()} />
        ) : (
          <div className="flex-1 overflow-y-auto py-6 scrollbar-thin">
            <div className="max-w-3xl mx-auto space-y-1">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  ref={(el) => (messageRefs.current[msg.id] = el)}
                  className="transition-all duration-300"
                >
                  <ChatMessage
                    content={msg.content}
                    role={msg.role}
                    createdAt={new Date(msg.created_at)}
                    isNew={msg.isNew}
                  />
                </div>
              ))}
              {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
                <TypingIndicator />
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
        )}

        <ChatInput 
          onSend={handleSend} 
          disabled={isLoading}
          inputRef={inputRef}
        />

        
        <MoodTracker open={showMoodTracker} onOpenChange={setShowMoodTracker} />
        <MoodHistory open={showMoodHistory} onOpenChange={setShowMoodHistory} />
        <GuidedPrompts open={showPrompts} onOpenChange={setShowPrompts} />
        <GoalTracker open={showGoals} onOpenChange={setShowGoals} />
      </div>
    </div>
  );
}
