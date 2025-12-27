import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useRewards } from "@/hooks/useRewards";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles } from "lucide-react";
import { CelebrationDialog } from "./CelebrationDialog";

interface CheckInDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reminder: {
    id: string;
    task: string;
  };
}

export function CheckInDialog({ open, onOpenChange, reminder }: CheckInDialogProps) {
  const [completed, setCompleted] = useState<boolean | null>(null);
  const [reflection, setReflection] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationType, setCelebrationType] = useState<"points" | "achievement" | "reminder">("points");
  const [celebrationPoints, setCelebrationPoints] = useState(0);
  const [newAchievements, setNewAchievements] = useState<any[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();
  const { awardPoints, incrementReminder } = useRewards();

  const handleSubmit = async () => {
    if (completed === null) {
      toast({
        title: "Please answer",
        description: "Did you complete this task?",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Mark reminder as completed
      const { error: reminderError } = await supabase
        .from("reminders")
        .update({ completed_at: new Date().toISOString() })
        .eq("id", reminder.id);

      if (reminderError) throw reminderError;

      // If user wrote a reflection, save it as a journal entry
      if (reflection.trim() && user) {
        const reflectionText = `Did I ${reminder.task}? ${completed ? "Yes" : "No"}. ${reflection.trim()}`;

        const { error: journalError } = await supabase.from("journal_entries").insert({
          user_id: user.id,
          content: reflectionText,
          role: "user",
        });

        if (journalError) {
          console.error("Error saving reflection:", journalError);
          // Don't fail the whole operation if journal save fails
        }
      }

      // Award rewards if completed
      if (completed && user) {
        // Award points for completing reminder
        const pointsAwarded = 15; // Base points for completing a reminder
        const result = await awardPoints(
          pointsAwarded,
          "reminder_completed",
          reminder.id,
          `Completed: ${reminder.task}`
        );

        // Increment reminder count and check for achievements
        const achievements = await incrementReminder();

        // Show celebration
        if (result.success || achievements.length > 0) {
          if (achievements.length > 0) {
            setNewAchievements(achievements);
            setCelebrationType("achievement");
            setCelebrationPoints(pointsAwarded);
          } else {
            setCelebrationType("points");
            setCelebrationPoints(pointsAwarded);
          }
          setShowCelebration(true);
        } else {
          toast({
            title: "Great job! 🎉",
            description: `You earned ${pointsAwarded} points!`,
          });
        }
      } else {
        toast({
          title: completed ? "Great job! 🎉" : "That's okay",
          description: completed
            ? "Your future self is proud of you."
            : "Every day is a new opportunity.",
        });
      }

      onOpenChange(false);
      setCompleted(null);
      setReflection("");
    } catch (error) {
      console.error("Error submitting check-in:", error);
      toast({
        title: "Something went wrong",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    onOpenChange(false);
    setCompleted(null);
    setReflection("");
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <DialogTitle>Future Self Check-In</DialogTitle>
          </div>
          <DialogDescription>
            Did you {reminder.task.toLowerCase()}?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex gap-2">
            <Button
              type="button"
              variant={completed === true ? "default" : "outline"}
              onClick={() => setCompleted(true)}
              className="flex-1"
            >
              Yes, I did it! ✅
            </Button>
            <Button
              type="button"
              variant={completed === false ? "default" : "outline"}
              onClick={() => setCompleted(false)}
              className="flex-1"
            >
              Not yet
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reflection">
              How will your future self feel about this? (Optional)
            </Label>
            <Textarea
              id="reflection"
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              placeholder="Reflect on how completing (or not completing) this task makes you feel..."
              className="min-h-[100px]"
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={handleSkip}>
            Skip
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Reflection"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <CelebrationDialog
      open={showCelebration}
      onClose={() => {
        setShowCelebration(false);
        setNewAchievements([]);
      }}
      type={celebrationType}
      points={celebrationPoints}
      achievement={
        newAchievements.length > 0
          ? {
              name: newAchievements[0].name,
              description: newAchievements[0].description,
              icon: newAchievements[0].icon,
            }
          : undefined
      }
      message={
        newAchievements.length > 0
          ? `You unlocked: ${newAchievements[0].name}!`
          : undefined
      }
    />
    </>
  );
}

