import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useMoods } from "@/hooks/useMoods";
import { useToast } from "@/hooks/use-toast";

const MOODS = [
  { emoji: "😢", label: "Struggling", score: 1 },
  { emoji: "😔", label: "Low", score: 2 },
  { emoji: "😐", label: "Okay", score: 3 },
  { emoji: "🙂", label: "Good", score: 4 },
  { emoji: "😊", label: "Great", score: 5 },
];

interface MoodTrackerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MoodTracker({ open, onOpenChange }: MoodTrackerProps) {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { logMood } = useMoods();
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (selectedMood === null) return;

    setIsSubmitting(true);
    const mood = MOODS[selectedMood];
    const result = await logMood(mood.emoji, mood.score, note);

    if (result) {
      toast({
        title: "Mood logged",
        description: `You're feeling ${mood.label.toLowerCase()} today.`,
      });
      setSelectedMood(null);
      setNote("");
      onOpenChange(false);
    } else {
      toast({
        title: "Failed to log mood",
        description: "Please try again.",
        variant: "destructive",
      });
    }
    setIsSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl text-center">
            How are you feeling?
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Mood Selection */}
          <div className="flex justify-center gap-2">
            {MOODS.map((mood, index) => (
              <button
                key={mood.score}
                onClick={() => setSelectedMood(index)}
                className={`text-4xl p-3 rounded-xl transition-all duration-200 hover:scale-110 ${
                  selectedMood === index
                    ? "bg-primary/20 ring-2 ring-primary scale-110"
                    : "hover:bg-muted"
                }`}
              >
                {mood.emoji}
              </button>
            ))}
          </div>

          {/* Selected Mood Label */}
          {selectedMood !== null && (
            <p className="text-center text-muted-foreground animate-fade-in">
              You're feeling{" "}
              <span className="font-medium text-foreground">
                {MOODS[selectedMood].label.toLowerCase()}
              </span>
            </p>
          )}

          {/* Optional Note */}
          <div className="space-y-2">
            <Textarea
              placeholder="Add a note about how you're feeling... (optional)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="resize-none"
              rows={3}
            />
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={selectedMood === null || isSubmitting}
            className="w-full"
          >
            {isSubmitting ? "Logging..." : "Log Mood"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
