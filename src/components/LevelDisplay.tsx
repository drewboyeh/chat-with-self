import { Progress } from "@/components/ui/progress";
import { getLevelInfo, getLevelTitle, getLevelEmoji } from "@/lib/levelSystem";
import { Badge } from "@/components/ui/badge";

interface LevelDisplayProps {
  totalPoints: number;
  showProgress?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function LevelDisplay({
  totalPoints,
  showProgress = true,
  size = "md",
  className = "",
}: LevelDisplayProps) {
  const levelInfo = getLevelInfo(totalPoints);
  const levelTitle = getLevelTitle(levelInfo.level);
  const levelEmoji = getLevelEmoji(levelInfo.level);

  const sizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge
            variant="secondary"
            className={`${sizeClasses[size]} font-semibold px-3 py-1`}
          >
            <span className="mr-1">{levelEmoji}</span>
            Level {levelInfo.level}
          </Badge>
          <span className={`${sizeClasses[size]} text-muted-foreground`}>
            {levelTitle}
          </span>
        </div>
        <div className={`${sizeClasses[size]} text-muted-foreground`}>
          {totalPoints.toLocaleString()} pts
        </div>
      </div>

      {showProgress && (
        <div className="space-y-1">
          <Progress
            value={levelInfo.progressPercent}
            className="h-2"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>
              {levelInfo.pointsInCurrentLevel.toLocaleString()} /{" "}
              {(levelInfo.nextLevelPoints - levelInfo.currentLevelPoints).toLocaleString()}{" "}
              points
            </span>
            <span>
              {levelInfo.pointsNeededForNext.toLocaleString()} to Level{" "}
              {levelInfo.level + 1}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

