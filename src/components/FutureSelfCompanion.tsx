import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useStreak } from "@/hooks/useStreak";
import { MessageCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface FutureSelfCompanionProps {
  className?: string;
}

export function FutureSelfCompanion({ className = "" }: FutureSelfCompanionProps) {
  const { streak } = useStreak();
  const { userName } = useAuth();
  const [companionMessage, setCompanionMessage] = useState("");
  const [showMessage, setShowMessage] = useState(false);

  const currentStreak = streak?.current_streak || 0;
  const longestStreak = streak?.longest_streak || 0;

  // Calculate realization percentage based on streak
  const calculateRealization = () => {
    // Simple calculation based on current streak
    return Math.min(100, currentStreak * 5);
  };

  const realization = calculateRealization();
  const stage = Math.floor(realization / 20) + 1; // 5 stages

  // Get stage description
  const getStageDescription = () => {
    if (stage === 1) return "Taking shape";
    if (stage === 2) return "Becoming defined";
    if (stage === 3) return "Personality emerging";
    if (stage === 4) return "Confident and strong";
    return "Fully realized";
  };

  // Get stage emoji/visual
  const getStageVisual = () => {
    if (stage === 1) return "👤"; // Shadow/outline
    if (stage === 2) return "🧑"; // Taking shape
    if (stage === 3) return "✨"; // Personality
    if (stage === 4) return "🌟"; // Confident
    return "💫"; // Fully realized
  };

  // Generate companion messages
  useEffect(() => {
    const messages = [
      "Every journal entry brings me closer to reality.",
      "You're doing great! I'm becoming more real every day.",
      "Your consistency is making me stronger.",
      "I'm proud of the person you're becoming.",
      "We're in this together. Keep going!",
      "Look how far we've come!",
      "Every goal you complete makes me more defined.",
      "I believe in you. You've got this.",
    ];

    // Add personalized messages based on progress
    if (realization >= 80) {
      messages.push("I'm almost fully realized! You're amazing!");
    } else if (realization >= 50) {
      messages.push("We're halfway there! Keep nurturing me!");
    } else if (realization >= 20) {
      messages.push("I'm taking shape! Thank you for your dedication.");
    }

    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    setCompanionMessage(randomMessage);
  }, [realization]);

  return (
    <Card className={`p-6 space-y-4 ${className}`}>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-4xl">{getStageVisual()}</span>
            <div>
              <h3 className="font-semibold text-lg">Your Future Self</h3>
              <p className="text-sm text-muted-foreground">
                {getStageDescription()}
              </p>
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowMessage(!showMessage)}
          className="text-primary"
        >
          <MessageCircle className="w-5 h-5" />
        </Button>
      </div>

      {showMessage && companionMessage && (
        <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
          <p className="text-sm text-foreground italic">
            "{companionMessage}"
          </p>
        </div>
      )}

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Realization</span>
          <span className="font-semibold">{realization}%</span>
        </div>
        <Progress value={realization} className="h-3" />
        <p className="text-xs text-muted-foreground">
          Stage {stage} of 5
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 pt-2 border-t">
        <div className="text-center">
          <div className="text-2xl mb-1">🔥</div>
          <div className="text-xs font-medium">{currentStreak}</div>
          <div className="text-xs text-muted-foreground">Day Streak</div>
        </div>
        <div className="text-center">
          <div className="text-2xl mb-1">🏆</div>
          <div className="text-xs font-medium">{longestStreak}</div>
          <div className="text-xs text-muted-foreground">Best Streak</div>
        </div>
      </div>

      <div className="pt-2 border-t">
        <p className="text-xs text-muted-foreground text-center">
          {userName ? `${userName}, ` : ""}every action brings your future self closer to reality.
        </p>
      </div>
    </Card>
  );
}
