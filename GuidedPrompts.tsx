import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Heart, Brain, Target, Sparkles } from "lucide-react";

const PROMPTS = {
  gratitude: [
    "What are three things you're grateful for today?",
    "Who made a positive difference in your life recently?",
    "What small pleasure did you enjoy today?",
    "What challenge taught you something valuable?",
    "What part of your body are you thankful for and why?",
  ],
  mindfulness: [
    "What are you feeling right now in this moment?",
    "Describe your current surroundings using all five senses.",
    "What thoughts keep recurring today? Just notice them.",
    "How does your body feel right now? Scan from head to toe.",
    "What emotion are you avoiding? Can you sit with it briefly?",
  ],
  cbt: [
    "What negative thought has been bothering you? Is it 100% true?",
    "What evidence supports and contradicts your worry?",
    "If a friend had this thought, what would you tell them?",
    "What's the worst, best, and most realistic outcome?",
    "What helpful action can you take about this situation?",
  ],
  goals: [
    "What's one small step you can take toward your biggest goal today?",
    "What obstacle is in your way, and how might you overcome it?",
    "Visualize achieving your goal. How does it feel?",
    "What would your future self thank you for doing today?",
    "What's one habit that would move you closer to your dreams?",
  ],
};

const CATEGORIES = [
  { id: "gratitude", label: "Gratitude", icon: Heart, color: "text-rose-500" },
  { id: "mindfulness", label: "Mindfulness", icon: Sparkles, color: "text-purple-500" },
  { id: "cbt", label: "Reflection", icon: Brain, color: "text-blue-500" },
  { id: "goals", label: "Goals", icon: Target, color: "text-emerald-500" },
];

interface GuidedPromptsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GuidedPrompts({ open, onOpenChange }: GuidedPromptsProps) {
  const [category, setCategory] = useState("gratitude");
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [response, setResponse] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const currentPrompts = PROMPTS[category as keyof typeof PROMPTS];
  const currentPrompt = currentPrompts[currentPromptIndex];

  const handleNewPrompt = () => {
    const nextIndex = (currentPromptIndex + 1) % currentPrompts.length;
    setCurrentPromptIndex(nextIndex);
    setResponse("");
  };

  const handleSubmit = async () => {
    if (!user || !response.trim()) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("prompt_responses").insert({
        user_id: user.id,
        prompt_category: category,
        prompt_text: currentPrompt,
        response: response.trim(),
      });

      if (error) throw error;

      toast({
        title: "Response saved",
        description: "Great job reflecting! Keep it up.",
      });
      setResponse("");
      handleNewPrompt();
    } catch (error) {
      console.error("Error saving response:", error);
      toast({
        title: "Failed to save",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const CategoryIcon = CATEGORIES.find((c) => c.id === category)?.icon || Heart;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">
            Daily Reflection
          </DialogTitle>
        </DialogHeader>

        <Tabs value={category} onValueChange={(v) => {
          setCategory(v);
          setCurrentPromptIndex(0);
          setResponse("");
        }}>
          <TabsList className="grid grid-cols-4 mb-4">
            {CATEGORIES.map((cat) => (
              <TabsTrigger
                key={cat.id}
                value={cat.id}
                className="flex flex-col gap-1 py-2"
              >
                <cat.icon className={`w-4 h-4 ${cat.color}`} />
                <span className="text-xs">{cat.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {CATEGORIES.map((cat) => (
            <TabsContent key={cat.id} value={cat.id} className="space-y-4">
              {/* Prompt Card */}
              <div className="bg-muted rounded-xl p-6 text-center">
                <CategoryIcon className={`w-8 h-8 mx-auto mb-4 ${CATEGORIES.find(c => c.id === category)?.color}`} />
                <p className="text-lg font-serif leading-relaxed">
                  {currentPrompt}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleNewPrompt}
                  className="mt-4 text-muted-foreground"
                >
                  Try another prompt
                </Button>
              </div>

              {/* Response Area */}
              <div className="space-y-3">
                <Textarea
                  placeholder="Take your time to reflect and write..."
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  className="min-h-32 resize-none"
                />
                <Button
                  onClick={handleSubmit}
                  disabled={!response.trim() || isSubmitting}
                  className="w-full"
                >
                  {isSubmitting ? "Saving..." : "Save Reflection"}
                </Button>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
