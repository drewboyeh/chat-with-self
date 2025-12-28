import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useRewards } from "@/hooks/useRewards";
import { useStreak } from "@/hooks/useStreak";
import { getLevelInfo, getLevelTitle } from "@/lib/levelSystem";
import { Sparkles, Heart, Share2, Download } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface FutureSelfArtProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showStats?: boolean;
  interactive?: boolean;
}

/**
 * Future Self Art - An original abstract art piece that evolves with user progress
 * This is original artwork, not based on any copyrighted material
 */
export function FutureSelfArt({ 
  className = "", 
  size = "md",
  showStats = true,
  interactive = true 
}: FutureSelfArtProps) {
  const { rewards, levelInfo } = useRewards();
  const { currentStreak } = useStreak();
  const { userName } = useAuth();
  const [isAnimating, setIsAnimating] = useState(false);

  // Calculate realization percentage
  const calculateRealization = () => {
    if (!rewards || !levelInfo) return 0;
    const levelProgress = levelInfo.progressPercent;
    const baseRealization = (levelInfo.level - 1) * 20;
    const currentLevelProgress = (levelProgress / 100) * 20;
    return Math.min(100, Math.round(baseRealization + currentLevelProgress));
  };

  const realization = calculateRealization();
  const stage = Math.floor(realization / 20) + 1;

  // Size configurations
  const sizeConfig = {
    sm: { art: "w-24 h-24", card: "p-4" },
    md: { art: "w-48 h-48", card: "p-6" },
    lg: { art: "w-64 h-64", card: "p-8" },
  };

  const config = sizeConfig[size];

  // Generate unique art based on realization
  const generateArt = () => {
    const complexity = Math.min(10, Math.floor(realization / 10) + 1);
    const opacity = 0.3 + (realization / 100) * 0.7;
    const rotation = (realization * 3.6) % 360; // Full rotation at 100%
    
    return {
      complexity,
      opacity,
      rotation,
      colors: getStageColors(stage),
    };
  };

  const artConfig = generateArt();

  // Get color palette for each stage
  function getStageColors(stage: number): { primary: string; secondary: string; accent: string } {
    const palettes = [
      { primary: "#6366f1", secondary: "#8b5cf6", accent: "#a78bfa" }, // Stage 1: Indigo/Purple
      { primary: "#3b82f6", secondary: "#60a5fa", accent: "#93c5fd" }, // Stage 2: Blue
      { primary: "#10b981", secondary: "#34d399", accent: "#6ee7b7" }, // Stage 3: Green
      { primary: "#f59e0b", secondary: "#fbbf24", accent: "#fcd34d" }, // Stage 4: Amber
      { primary: "#ec4899", secondary: "#f472b6", accent: "#fbcfe8" }, // Stage 5: Pink
    ];
    return palettes[Math.min(stage - 1, palettes.length - 1)];
  }

  // Trigger animation on realization change
  useEffect(() => {
    if (realization > 0) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [realization]);

  // Export as image (for sharing)
  const handleExport = async () => {
    // This would export the art as an image
    // Implementation would use canvas API
    console.log("Export art as image");
  };

  if (!rewards || !levelInfo) {
    return null;
  }

  return (
    <Card className={`${config.card} space-y-4 ${className}`}>
      <div className="flex flex-col items-center space-y-4">
        {/* Abstract Art Piece */}
        <div 
          className={`${config.art} relative rounded-2xl overflow-hidden bg-gradient-to-br from-background to-muted border-2 border-border`}
          style={{
            boxShadow: `0 0 40px ${artConfig.colors.primary}40`,
          }}
        >
          <svg
            viewBox="0 0 200 200"
            className="w-full h-full"
            style={{
              filter: `hue-rotate(${artConfig.rotation}deg)`,
            }}
          >
            {/* Base layer - evolving geometric shapes */}
            <defs>
              <linearGradient id="primaryGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={artConfig.colors.primary} stopOpacity={artConfig.opacity} />
                <stop offset="100%" stopColor={artConfig.colors.secondary} stopOpacity={artConfig.opacity * 0.7} />
              </linearGradient>
              <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={artConfig.colors.accent} stopOpacity={artConfig.opacity * 0.5} />
                <stop offset="100%" stopColor={artConfig.colors.primary} stopOpacity={artConfig.opacity * 0.3} />
              </linearGradient>
            </defs>

            {/* Stage 1: Simple circles */}
            {stage >= 1 && (
              <>
                <circle cx="100" cy="100" r="30" fill="url(#primaryGrad)" className={isAnimating ? "animate-pulse" : ""} />
                <circle cx="100" cy="100" r="20" fill="url(#accentGrad)" opacity="0.6" />
              </>
            )}

            {/* Stage 2: Adding geometric patterns */}
            {stage >= 2 && (
              <>
                <polygon points="100,50 150,100 100,150 50,100" fill="none" stroke={artConfig.colors.secondary} strokeWidth="2" opacity={artConfig.opacity * 0.6} />
                <polygon points="100,70 130,100 100,130 70,100" fill="url(#accentGrad)" opacity="0.4" />
              </>
            )}

            {/* Stage 3: More complex patterns */}
            {stage >= 3 && (
              <>
                {[...Array(artConfig.complexity)].map((_, i) => {
                  const angle = (i * 360) / artConfig.complexity;
                  const radius = 60;
                  const x = 100 + radius * Math.cos((angle * Math.PI) / 180);
                  const y = 100 + radius * Math.sin((angle * Math.PI) / 180);
                  return (
                    <circle
                      key={i}
                      cx={x}
                      cy={y}
                      r="8"
                      fill={artConfig.colors.accent}
                      opacity={artConfig.opacity * 0.5}
                      className={isAnimating ? "animate-pulse" : ""}
                      style={{ animationDelay: `${i * 0.1}s` }}
                    />
                  );
                })}
              </>
            )}

            {/* Stage 4: Intricate details */}
            {stage >= 4 && (
              <>
                <path
                  d={`M 100,100 L ${100 + 40 * Math.cos(0)},${100 + 40 * Math.sin(0)} L ${100 + 40 * Math.cos(Math.PI / 3)},${100 + 40 * Math.sin(Math.PI / 3)} Z`}
                  fill="url(#primaryGrad)"
                  opacity="0.3"
                />
                <path
                  d={`M 100,100 L ${100 + 40 * Math.cos(Math.PI / 3)},${100 + 40 * Math.sin(Math.PI / 3)} L ${100 + 40 * Math.cos((2 * Math.PI) / 3)},${100 + 40 * Math.sin((2 * Math.PI) / 3)} Z`}
                  fill="url(#accentGrad)"
                  opacity="0.3"
                />
                <path
                  d={`M 100,100 L ${100 + 40 * Math.cos((2 * Math.PI) / 3)},${100 + 40 * Math.sin((2 * Math.PI) / 3)} L ${100 + 40 * Math.cos(Math.PI)},${100 + 40 * Math.sin(Math.PI)} Z`}
                  fill="url(#primaryGrad)"
                  opacity="0.3"
                />
              </>
            )}

            {/* Stage 5: Fully realized - complex art */}
            {stage >= 5 && (
              <>
                {/* Spiral pattern */}
                {[...Array(20)].map((_, i) => {
                  const spiralRadius = 10 + i * 2;
                  const spiralAngle = i * 18;
                  const x = 100 + spiralRadius * Math.cos((spiralAngle * Math.PI) / 180);
                  const y = 100 + spiralRadius * Math.sin((spiralAngle * Math.PI) / 180);
                  return (
                    <circle
                      key={`spiral-${i}`}
                      cx={x}
                      cy={y}
                      r="3"
                      fill={i % 2 === 0 ? artConfig.colors.primary : artConfig.colors.accent}
                      opacity={artConfig.opacity * (1 - i / 20)}
                      className={isAnimating ? "animate-pulse" : ""}
                    />
                  );
                })}
                {/* Central glow */}
                <circle cx="100" cy="100" r="15" fill={artConfig.colors.primary} opacity={artConfig.opacity * 0.8}>
                  <animate attributeName="r" values="15;20;15" dur="2s" repeatCount="indefinite" />
                </circle>
              </>
            )}

            {/* Overlay pattern for texture */}
            <rect width="200" height="200" fill="url(#primaryGrad)" opacity="0.05" />
          </svg>

          {/* Glow effect */}
          {realization >= 50 && (
            <div
              className="absolute inset-0 rounded-2xl pointer-events-none"
              style={{
                boxShadow: `inset 0 0 60px ${artConfig.colors.primary}30`,
                animation: isAnimating ? "pulse 1s" : "none",
              }}
            />
          )}
        </div>

        {/* Art Title */}
        <div className="text-center space-y-1">
          <h3 className="font-semibold text-lg">Future Self</h3>
          <p className="text-sm text-muted-foreground">
            {getStageTitle(stage)} • {realization}% Realized
          </p>
        </div>

        {/* Progress Bar */}
        {showStats && (
          <div className="w-full space-y-2">
            <Progress value={realization} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Stage {stage} of 5</span>
              <span>{100 - realization}% to next stage</span>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        {showStats && (
          <div className="grid grid-cols-3 gap-3 w-full pt-2 border-t">
            <div className="text-center">
              <div className="text-lg font-semibold">{currentStreak}</div>
              <div className="text-xs text-muted-foreground">Day Streak</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">{levelInfo.level}</div>
              <div className="text-xs text-muted-foreground">Level</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">{rewards.completed_goals}</div>
              <div className="text-xs text-muted-foreground">Goals</div>
            </div>
          </div>
        )}

        {/* Share/Export Buttons */}
        {interactive && (
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              className="flex-1"
            >
              <Download className="w-4 h-4 mr-2" />
              Save Art
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // Share functionality
                if (navigator.share) {
                  navigator.share({
                    title: "My Future Self Art",
                    text: `My future self is ${realization}% realized!`,
                  });
                }
              }}
              className="flex-1"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}

function getStageTitle(stage: number): string {
  const titles = [
    "Taking Shape",
    "Becoming Defined",
    "Personality Emerging",
    "Confident & Strong",
    "Fully Realized",
  ];
  return titles[Math.min(stage - 1, titles.length - 1)];
}

