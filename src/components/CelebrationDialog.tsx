import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, Trophy, Star, Zap } from "lucide-react";

interface CelebrationDialogProps {
  open: boolean;
  onClose: () => void;
  type: "points" | "achievement" | "goal" | "reminder";
  points?: number;
  achievement?: {
    name: string;
    description: string;
    icon: string | null;
  };
  message?: string;
}

export function CelebrationDialog({
  open,
  onClose,
  type,
  points,
  achievement,
  message,
}: CelebrationDialogProps) {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (open) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const getContent = () => {
    switch (type) {
      case "points":
        return {
          icon: <Zap className="w-16 h-16 text-yellow-500" />,
          title: `+${points} Points!`,
          description: message || "You're making progress!",
          emoji: "💰",
        };
      case "achievement":
        return {
          icon: <Trophy className="w-16 h-16 text-yellow-500" />,
          title: "Achievement Unlocked!",
          description: achievement?.name || "You earned an achievement!",
          emoji: achievement?.icon || "🏆",
        };
      case "goal":
        return {
          icon: <Star className="w-16 h-16 text-yellow-500" />,
          title: "Goal Completed!",
          description: message || "Amazing work!",
          emoji: "🎯",
        };
      case "reminder":
        return {
          icon: <Sparkles className="w-16 h-16 text-yellow-500" />,
          title: "Task Completed!",
          description: message || "You did it!",
          emoji: "✅",
        };
      default:
        return {
          icon: <Sparkles className="w-16 h-16 text-yellow-500" />,
          title: "Great Job!",
          description: "Keep it up!",
          emoji: "🎉",
        };
    }
  };

  const content = getContent();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px] text-center">
        <div className="relative">
          {showConfetti && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="absolute animate-bounce"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 2}s`,
                    animationDuration: `${1 + Math.random()}s`,
                  }}
                >
                  <span className="text-2xl">
                    {["🎉", "✨", "⭐", "💫", "🌟"][Math.floor(Math.random() * 5)]}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className="text-6xl animate-bounce">{content.emoji}</div>
            <div className="flex items-center justify-center">{content.icon}</div>
            <h2 className="text-2xl font-bold text-foreground">{content.title}</h2>
            <p className="text-muted-foreground">{content.description}</p>
            {achievement && (
              <div className="mt-4 p-4 bg-primary/10 rounded-lg">
                <p className="text-sm text-muted-foreground">{achievement.description}</p>
              </div>
            )}
            {points && (
              <div className="mt-2 text-3xl font-bold text-yellow-500">
                +{points} Points
              </div>
            )}
            <Button onClick={onClose} className="mt-4">
              Awesome!
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

