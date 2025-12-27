import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getLevelTitle, getLevelEmoji } from "@/lib/levelSystem";
import { Sparkles, TrendingUp, Star } from "lucide-react";

interface LevelUpDialogProps {
  open: boolean;
  onClose: () => void;
  oldLevel: number;
  newLevel: number;
  totalPoints: number;
}

export function LevelUpDialog({
  open,
  onClose,
  oldLevel,
  newLevel,
  totalPoints,
}: LevelUpDialogProps) {
  const [showConfetti, setShowConfetti] = useState(false);
  const [showStars, setShowStars] = useState(false);

  useEffect(() => {
    if (open) {
      setShowConfetti(true);
      setShowStars(true);
      const timer1 = setTimeout(() => setShowConfetti(false), 3000);
      const timer2 = setTimeout(() => setShowStars(false), 2000);
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [open]);

  const levelTitle = getLevelTitle(newLevel);
  const levelEmoji = getLevelEmoji(newLevel);
  const oldLevelEmoji = getLevelEmoji(oldLevel);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px] text-center">
        <div className="relative">
          {showConfetti && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(30)].map((_, i) => (
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
                    {["🎉", "✨", "⭐", "💫", "🌟", "🎊", "🔥"][
                      Math.floor(Math.random() * 7)
                    ]}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-col items-center justify-center py-8 space-y-6">
            {showStars && (
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
                <Star className="w-12 h-12 text-yellow-500 animate-pulse" />
              </div>
            )}

            <div className="relative">
              <div className="text-8xl animate-bounce mb-4">
                {levelEmoji}
              </div>
              <div className="absolute -top-2 -right-2">
                <TrendingUp className="w-8 h-8 text-green-500 animate-pulse" />
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-foreground">
                Level Up!
              </h2>
              <div className="flex items-center justify-center gap-3 text-2xl">
                <span className="text-muted-foreground">
                  {oldLevelEmoji} Level {oldLevel}
                </span>
                <Sparkles className="w-6 h-6 text-yellow-500" />
                <span className="font-bold text-primary">
                  {levelEmoji} Level {newLevel}
                </span>
              </div>
              <p className="text-lg text-muted-foreground font-medium">
                {levelTitle}
              </p>
            </div>

            <div className="mt-4 p-4 bg-primary/10 rounded-lg w-full">
              <p className="text-sm text-muted-foreground">
                You've reached <span className="font-semibold">{totalPoints.toLocaleString()} points</span>!
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Keep going to unlock the next level!
              </p>
            </div>

            <Button onClick={onClose} className="mt-4" size="lg">
              Awesome!
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

