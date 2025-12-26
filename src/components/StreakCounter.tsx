import { Flame } from "lucide-react";
import { useStreak } from "@/hooks/useStreak";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function StreakCounter() {
  const { streak, isLoading } = useStreak();

  if (isLoading || !streak) {
    return null;
  }

  const currentStreak = streak.current_streak || 0;

  if (currentStreak === 0) {
    return null; // Don't show if no streak yet
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 hover:bg-orange-500/15 transition-colors cursor-help">
            <Flame className="w-4 h-4 text-orange-500" fill="currentColor" />
            <span className="text-sm font-semibold text-orange-600 dark:text-orange-500">
              {currentStreak}
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <div className="space-y-1">
            <p className="font-semibold">🔥 {currentStreak} day streak!</p>
            {streak.longest_streak > currentStreak && (
              <p className="text-xs text-muted-foreground">
                Best: {streak.longest_streak} days
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Keep journaling daily to maintain your streak!
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

