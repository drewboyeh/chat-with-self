import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useRewards } from "@/hooks/useRewards";
import { useStreak } from "@/hooks/useStreak";
import { getLevelInfo, getLevelTitle } from "@/lib/levelSystem";
import { Sparkles, Heart, Share2, Download, Star } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface FutureSelfArtProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showStats?: boolean;
  interactive?: boolean;
}

/**
 * Future Self Art - Original artwork inspired by Starry Night's swirling, dreamy aesthetic
 * This is ORIGINAL artwork, not a copy of Starry Night. It uses similar artistic techniques
 * (swirling patterns, stars, night sky) but is a unique composition created for this app.
 * 
 * Legal Status: 100% Original - Safe for public and commercial use
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
    const complexity = Math.min(15, Math.floor(realization / 7) + 1);
    const opacity = 0.4 + (realization / 100) * 0.6;
    const swirlIntensity = realization / 100;
    
    return {
      complexity,
      opacity,
      swirlIntensity,
      colors: getStageColors(stage),
    };
  };

  const artConfig = generateArt();

  // Get color palette inspired by night sky (but original colors)
  function getStageColors(stage: number): { 
    sky: string; 
    stars: string; 
    swirl: string; 
    accent: string;
    moon: string;
  } {
    const palettes = [
      // Stage 1: Deep night - dark blues and purples
      { 
        sky: "#1e1b4b",      // Deep indigo
        stars: "#6366f1",    // Indigo stars
        swirl: "#4f46e5",    // Indigo swirl
        accent: "#818cf8",   // Light indigo
        moon: "#c7d2fe"      // Pale blue moon
      },
      // Stage 2: Midnight - rich blues
      { 
        sky: "#1e3a8a",      // Deep blue
        stars: "#3b82f6",    // Blue stars
        swirl: "#2563eb",    // Blue swirl
        accent: "#60a5fa",   // Light blue
        moon: "#dbeafe"      // Sky blue moon
      },
      // Stage 3: Twilight - purple-blue mix
      { 
        sky: "#312e81",      // Deep purple-blue
        stars: "#8b5cf6",    // Purple stars
        swirl: "#7c3aed",    // Purple swirl
        accent: "#a78bfa",  // Light purple
        moon: "#e9d5ff"      // Lavender moon
      },
      // Stage 4: Starlight - bright and vibrant
      { 
        sky: "#1e293b",      // Dark slate
        stars: "#fbbf24",    // Golden stars
        swirl: "#f59e0b",    // Amber swirl
        accent: "#fcd34d",  // Yellow accent
        moon: "#fef3c7"      // Cream moon
      },
      // Stage 5: Full realization - brilliant night
      { 
        sky: "#0f172a",      // Deepest night
        stars: "#ec4899",    // Pink stars
        swirl: "#f472b6",    // Rose swirl
        accent: "#fbcfe8",  // Light pink
        moon: "#fce7f3"      // Pink moon
      },
    ];
    return palettes[Math.min(stage - 1, palettes.length - 1)];
  }

  // Trigger animation on realization change
  useEffect(() => {
    if (realization > 0) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 1500);
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
        {/* Starry Night-Inspired Art Piece */}
        <div 
          className={`${config.art} relative rounded-2xl overflow-hidden border-2 border-border`}
          style={{
            background: `linear-gradient(180deg, ${artConfig.colors.sky} 0%, ${artConfig.colors.sky}dd 100%)`,
            boxShadow: `0 0 60px ${artConfig.colors.swirl}40, inset 0 0 100px ${artConfig.colors.sky}80`,
          }}
        >
          <svg
            viewBox="0 0 400 400"
            className="w-full h-full"
            preserveAspectRatio="xMidYMid slice"
          >
            <defs>
              {/* Swirling gradient - inspired by Starry Night's technique */}
              <radialGradient id="swirlGrad" cx="50%" cy="50%">
                <stop offset="0%" stopColor={artConfig.colors.swirl} stopOpacity={artConfig.opacity * artConfig.swirlIntensity} />
                <stop offset="50%" stopColor={artConfig.colors.accent} stopOpacity={artConfig.opacity * 0.5} />
                <stop offset="100%" stopColor={artConfig.colors.sky} stopOpacity="0" />
              </radialGradient>
              
              {/* Star glow */}
              <radialGradient id="starGlow" cx="50%" cy="50%">
                <stop offset="0%" stopColor={artConfig.colors.stars} stopOpacity="1" />
                <stop offset="70%" stopColor={artConfig.colors.stars} stopOpacity="0.3" />
                <stop offset="100%" stopColor={artConfig.colors.stars} stopOpacity="0" />
              </radialGradient>

              {/* Moon glow */}
              <radialGradient id="moonGlow" cx="50%" cy="50%">
                <stop offset="0%" stopColor={artConfig.colors.moon} stopOpacity="0.9" />
                <stop offset="100%" stopColor={artConfig.colors.moon} stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Base sky layer */}
            <rect width="400" height="400" fill={artConfig.colors.sky} />

            {/* Swirling patterns - inspired by Starry Night's technique but original composition */}
            {stage >= 1 && (
              <>
                {/* Central swirl - original composition */}
                <path
                  d={`M 200,200 Q ${200 + 30 * Math.cos(0)},${200 + 30 * Math.sin(0)} ${200 + 60 * Math.cos(Math.PI / 4)},${200 + 60 * Math.sin(Math.PI / 4)} T ${200 + 90 * Math.cos(Math.PI / 2)},${200 + 90 * Math.sin(Math.PI / 2)}`}
                  fill="none"
                  stroke={artConfig.colors.swirl}
                  strokeWidth={2 + artConfig.swirlIntensity * 3}
                  opacity={artConfig.opacity * 0.6}
                  className={isAnimating ? "animate-pulse" : ""}
                />
              </>
            )}

            {/* More complex swirls as stage increases */}
            {stage >= 2 && (
              <>
                {[...Array(Math.floor(artConfig.complexity / 2))].map((_, i) => {
                  const angle = (i * 360) / (artConfig.complexity / 2);
                  const radius = 80 + (i % 3) * 20;
                  const startX = 200 + radius * Math.cos((angle * Math.PI) / 180);
                  const startY = 200 + radius * Math.sin((angle * Math.PI) / 180);
                  const endX = 200 + (radius + 40) * Math.cos(((angle + 45) * Math.PI) / 180);
                  const endY = 200 + (radius + 40) * Math.sin(((angle + 45) * Math.PI) / 180);
                  
                  return (
                    <path
                      key={`swirl-${i}`}
                      d={`M ${startX},${startY} Q ${startX + 20},${startY + 20} ${endX},${endY}`}
                      fill="none"
                      stroke={artConfig.colors.swirl}
                      strokeWidth={1.5}
                      opacity={artConfig.opacity * 0.4}
                      className={isAnimating ? "animate-pulse" : ""}
                      style={{ animationDelay: `${i * 0.1}s` }}
                    />
                  );
                })}
              </>
            )}

            {/* Stars - original pattern */}
            {stage >= 1 && (
              <>
                {generateStars(artConfig.complexity, artConfig.colors, artConfig.opacity, stage).map((star, i) => (
                  <g key={`star-${i}`}>
                    <circle
                      cx={star.x}
                      cy={star.y}
                      r={star.size}
                      fill={star.color}
                      opacity={star.opacity}
                      className={isAnimating ? "animate-pulse" : ""}
                      style={{ animationDelay: `${star.delay}s` }}
                    >
                      {star.size > 2 && (
                        <animate
                          attributeName="opacity"
                          values={`${star.opacity};${star.opacity * 1.5};${star.opacity}`}
                          dur={`${2 + Math.random() * 2}s`}
                          repeatCount="indefinite"
                        />
                      )}
                    </circle>
                    {/* Star glow for larger stars */}
                    {star.size > 3 && (
                      <circle
                        cx={star.x}
                        cy={star.y}
                        r={star.size * 2}
                        fill="url(#starGlow)"
                        opacity={star.opacity * 0.3}
                      />
                    )}
                  </g>
                ))}
              </>
            )}

            {/* Moon - original design */}
            {stage >= 3 && (
              <>
                <circle
                  cx="320"
                  cy="80"
                  r={20 + stage * 2}
                  fill={artConfig.colors.moon}
                  opacity={0.8 + (stage - 3) * 0.1}
                >
                  <animate
                    attributeName="opacity"
                    values={`${0.8 + (stage - 3) * 0.1};${0.9 + (stage - 3) * 0.1};${0.8 + (stage - 3) * 0.1}`}
                    dur="3s"
                    repeatCount="indefinite"
                  />
                </circle>
                <circle
                  cx="320"
                  cy="80"
                  r={(20 + stage * 2) * 1.5}
                  fill="url(#moonGlow)"
                  opacity="0.3"
                />
              </>
            )}

            {/* Additional swirling patterns for higher stages */}
            {stage >= 4 && (
              <>
                {/* More intense swirls */}
                {[...Array(5)].map((_, i) => {
                  const centerX = 200 + (i - 2) * 40;
                  const centerY = 200 + (i % 2) * 30;
                  return (
                    <ellipse
                      key={`swirl-ellipse-${i}`}
                      cx={centerX}
                      cy={centerY}
                      rx={30 + i * 5}
                      ry={15 + i * 3}
                      fill="url(#swirlGrad)"
                      opacity={artConfig.opacity * 0.3}
                      transform={`rotate(${i * 15} ${centerX} ${centerY})`}
                      className={isAnimating ? "animate-pulse" : ""}
                    />
                  );
                })}
              </>
            )}

            {/* Stage 5: Fully realized - brilliant night sky */}
            {stage >= 5 && (
              <>
                {/* Additional glowing elements */}
                <circle cx="200" cy="200" r="100" fill="url(#swirlGrad)" opacity="0.2" />
                {/* Constellation patterns */}
                {[...Array(3)].map((_, i) => {
                  const baseX = 100 + i * 100;
                  const baseY = 150 + (i % 2) * 100;
                  return (
                    <g key={`constellation-${i}`}>
                      {[...Array(4)].map((_, j) => {
                        const x = baseX + (j - 1.5) * 15;
                        const y = baseY + Math.sin(j) * 10;
                        return (
                          <line
                            key={`line-${j}`}
                            x1={j > 0 ? baseX + (j - 2.5) * 15 : x}
                            y1={j > 0 ? baseY + Math.sin(j - 1) * 10 : y}
                            x2={x}
                            y2={y}
                            stroke={artConfig.colors.accent}
                            strokeWidth="1"
                            opacity={artConfig.opacity * 0.4}
                          />
                        );
                      })}
                    </g>
                  );
                })}
              </>
            )}
          </svg>

          {/* Glow effect overlay */}
          {realization >= 50 && (
            <div
              className="absolute inset-0 rounded-2xl pointer-events-none"
              style={{
                boxShadow: `inset 0 0 80px ${artConfig.colors.swirl}30, 0 0 40px ${artConfig.colors.stars}20`,
                animation: isAnimating ? "pulse 1.5s" : "none",
              }}
            />
          )}
        </div>

        {/* Art Title */}
        <div className="text-center space-y-1">
          <h3 className="font-semibold text-lg flex items-center justify-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            Future Self
          </h3>
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
                if (navigator.share) {
                  navigator.share({
                    title: "My Future Self Art",
                    text: `My future self is ${realization}% realized! 🌟`,
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

// Generate star positions - original pattern
function generateStars(
  count: number,
  colors: any,
  opacity: number,
  stage: number
): Array<{ x: number; y: number; size: number; color: string; opacity: number; delay: number }> {
  const stars: Array<{ x: number; y: number; size: number; color: string; opacity: number; delay: number }> = [];
  
  for (let i = 0; i < count; i++) {
    // Original star distribution - not copying Starry Night's exact positions
    const angle = (i * 137.5) % 360; // Golden angle for natural distribution
    const radius = 50 + (i % 5) * 30;
    const x = 200 + radius * Math.cos((angle * Math.PI) / 180);
    const y = 200 + radius * Math.sin((angle * Math.PI) / 180);
    
    // Vary star sizes
    const size = 1 + (i % 4) * 0.5 + (stage >= 4 ? 1 : 0);
    
    // Vary colors slightly
    const colorVariation = i % 3 === 0 ? colors.accent : colors.stars;
    
    stars.push({
      x: Math.max(10, Math.min(390, x)),
      y: Math.max(10, Math.min(390, y)),
      size,
      color: colorVariation,
      opacity: opacity * (0.6 + (i % 3) * 0.2),
      delay: (i * 0.1) % 2,
    });
  }
  
  return stars;
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
