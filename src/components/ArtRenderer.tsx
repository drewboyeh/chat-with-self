import { useEffect, useState } from "react";

interface ArtRendererProps {
  artData: any;
  size?: "sm" | "md" | "lg";
  completionPercentage?: number;
  className?: string;
}

/**
 * Renders art piece from art data
 * Creates original Starry Night-inspired artwork
 */
export function ArtRenderer({
  artData,
  size = "md",
  completionPercentage = 100,
  className = "",
}: ArtRendererProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (artData?.animations) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [artData?.animations, completionPercentage]);

  const sizeClasses = {
    sm: "w-24 h-24",
    md: "w-48 h-48",
    lg: "w-96 h-96",
  };

  const colors = artData?.colors || {
    sky: "#1e1b4b",
    stars: "#6366f1",
    swirl: "#4f46e5",
    accent: "#818cf8",
    moon: "#c7d2fe",
  };

  const opacity = completionPercentage / 100;
  const complexity = artData?.complexity || 10;
  const elements = artData?.elements || [];

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      <div
        className="w-full h-full rounded-xl overflow-hidden border-2 border-border"
        style={{
          background: `linear-gradient(180deg, ${colors.sky} 0%, ${colors.sky}dd 100%)`,
          boxShadow: `0 0 60px ${colors.swirl}${Math.floor(40 * opacity)}, inset 0 0 100px ${colors.sky}${Math.floor(80 * opacity)}`,
        }}
      >
        <svg
          viewBox="0 0 400 400"
          className="w-full h-full"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <radialGradient id={`swirlGrad-${size}`} cx="50%" cy="50%">
              <stop offset="0%" stopColor={colors.swirl} stopOpacity={(complexity / 100) * opacity} />
              <stop offset="50%" stopColor={colors.accent} stopOpacity={0.5 * opacity} />
              <stop offset="100%" stopColor={colors.sky} stopOpacity="0" />
            </radialGradient>
            
            <radialGradient id={`starGlow-${size}`} cx="50%" cy="50%">
              <stop offset="0%" stopColor={colors.stars} stopOpacity="1" />
              <stop offset="70%" stopColor={colors.stars} stopOpacity="0.3" />
              <stop offset="100%" stopColor={colors.stars} stopOpacity="0" />
            </radialGradient>

            <radialGradient id={`moonGlow-${size}`} cx="50%" cy="50%">
              <stop offset="0%" stopColor={colors.moon} stopOpacity="0.9" />
              <stop offset="100%" stopColor={colors.moon} stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Base sky */}
          <rect width="400" height="400" fill={colors.sky} />

          {/* Render elements from art data */}
          {elements.map((element: any, i: number) => {
            if (element.type === "star") {
              const starColor = element.color === "accent" ? colors.accent : colors.stars;
              return (
                <g key={`star-${i}`}>
                  <circle
                    cx={element.x}
                    cy={element.y}
                    r={element.size || 2}
                    fill={starColor}
                    opacity={(element.opacity || 0.8) * opacity}
                    className={isAnimating ? "animate-pulse" : ""}
                    style={{ animationDelay: `${(i * 0.1) % 2}s` }}
                  >
                    {element.size && element.size > 2 && (
                      <animate
                        attributeName="opacity"
                        values={`${(element.opacity || 0.8) * opacity};${(element.opacity || 0.8) * 1.5 * opacity};${(element.opacity || 0.8) * opacity}`}
                        dur={`${2 + Math.random() * 2}s`}
                        repeatCount="indefinite"
                      />
                    )}
                  </circle>
                  {element.size && element.size > 3 && (
                    <circle
                      cx={element.x}
                      cy={element.y}
                      r={(element.size || 2) * 2}
                      fill={`url(#starGlow-${size})`}
                      opacity={(element.opacity || 0.3) * opacity}
                    />
                  )}
                </g>
              );
            }

            if (element.type === "swirl") {
              return (
                <path
                  key={`swirl-${i}`}
                  d={`M ${element.x},${element.y} Q ${element.x + 20},${element.y + 20} ${element.x + 40},${element.y + 40}`}
                  fill="none"
                  stroke={colors.swirl}
                  strokeWidth={1.5}
                  opacity={(element.opacity || 0.4) * opacity}
                  className={isAnimating ? "animate-pulse" : ""}
                  style={{ animationDelay: `${(i * 0.1) % 2}s` }}
                />
              );
            }

            if (element.type === "moon") {
              return (
                <g key={`moon-${i}`}>
                  <circle
                    cx={element.x}
                    cy={element.y}
                    r={element.size || 20}
                    fill={colors.moon}
                    opacity={(element.opacity || 0.8) * opacity}
                  >
                    <animate
                      attributeName="opacity"
                      values={`${(element.opacity || 0.8) * opacity};${(element.opacity || 0.9) * opacity};${(element.opacity || 0.8) * opacity}`}
                      dur="3s"
                      repeatCount="indefinite"
                    />
                  </circle>
                  <circle
                    cx={element.x}
                    cy={element.y}
                    r={(element.size || 20) * 1.5}
                    fill={`url(#moonGlow-${size})`}
                    opacity="0.3"
                  />
                </g>
              );
            }

            if (element.type === "constellation") {
              return (
                <g key={`constellation-${i}`}>
                  {[...Array(4)].map((_, j) => {
                    const x1 = element.x + (j - 1.5) * 15;
                    const y1 = element.y + Math.sin(j) * 10;
                    const x2 = element.x + (j - 0.5) * 15;
                    const y2 = element.y + Math.sin(j + 1) * 10;
                    return (
                      <line
                        key={`line-${j}`}
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke={colors.accent}
                        strokeWidth="1"
                        opacity={(element.opacity || 0.4) * opacity}
                      />
                    );
                  })}
                </g>
              );
            }

            if (element.type === "glow") {
              return (
                <circle
                  key={`glow-${i}`}
                  cx={element.x}
                  cy={element.y}
                  r={element.size || 100}
                  fill={`url(#swirlGrad-${size})`}
                  opacity={(element.opacity || 0.2) * opacity}
                />
              );
            }

            return null;
          })}
        </svg>

        {/* Glow overlay for completed pieces */}
        {completionPercentage >= 50 && (
          <div
            className="absolute inset-0 rounded-xl pointer-events-none"
            style={{
              boxShadow: `inset 0 0 80px ${colors.swirl}${Math.floor(30 * opacity)}, 0 0 40px ${colors.stars}${Math.floor(20 * opacity)}`,
              animation: isAnimating ? "pulse 1.5s" : "none",
            }}
          />
        )}
      </div>

      {/* Completion indicator for in-progress pieces */}
      {completionPercentage < 100 && (
        <div className="absolute bottom-0 left-0 right-0 p-2 bg-background/80 backdrop-blur-sm rounded-b-xl">
          <div className="flex items-center gap-2 text-xs">
            <div className="h-1 flex-1 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
            <span className="text-muted-foreground">{completionPercentage}%</span>
          </div>
        </div>
      )}
    </div>
  );
}

