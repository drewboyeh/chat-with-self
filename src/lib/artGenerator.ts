/**
 * Art Generator - Creates original Starry Night-inspired art pieces
 * Art pieces vary by size and "fame level" based on goal timeframe
 */

export type ArtSize = "small" | "medium" | "large" | "masterpiece";
export type FameLevel = "common" | "uncommon" | "rare" | "epic" | "legendary";
export type ArtType = "daily" | "weekly" | "monthly" | "yearly" | "long_term" | "masterpiece";

export interface ArtPiece {
  id: string;
  title: string;
  description: string;
  size: ArtSize;
  fameLevel: FameLevel;
  artType: ArtType;
  artData: ArtData;
  completionPercentage?: number; // For long-term goals
}

export interface ArtData {
  complexity: number;
  colors: ColorPalette;
  elements: ArtElement[];
  animations: boolean;
}

export interface ColorPalette {
  sky: string;
  stars: string;
  swirl: string;
  accent: string;
  moon: string;
}

export interface ArtElement {
  type: "star" | "swirl" | "moon" | "constellation" | "glow";
  x: number;
  y: number;
  size?: number;
  color?: string;
  opacity?: number;
}

/**
 * Get art size and fame level based on goal timeframe
 */
export function getArtMetadata(timeframe: string, completionCount: number = 1): {
  size: ArtSize;
  fameLevel: FameLevel;
  artType: ArtType;
} {
  switch (timeframe) {
    case "daily":
      if (completionCount >= 365) {
        return { size: "large", fameLevel: "epic", artType: "yearly" };
      } else if (completionCount >= 30) {
        return { size: "medium", fameLevel: "rare", artType: "monthly" };
      } else if (completionCount >= 7) {
        return { size: "small", fameLevel: "uncommon", artType: "weekly" };
      }
      return { size: "small", fameLevel: "common", artType: "daily" };
    
    case "weekly":
      if (completionCount >= 52) {
        return { size: "large", fameLevel: "epic", artType: "yearly" };
      } else if (completionCount >= 12) {
        return { size: "medium", fameLevel: "rare", artType: "monthly" };
      }
      return { size: "small", fameLevel: "uncommon", artType: "weekly" };
    
    case "monthly":
      if (completionCount >= 12) {
        return { size: "large", fameLevel: "epic", artType: "yearly" };
      }
      return { size: "medium", fameLevel: "rare", artType: "monthly" };
    
    case "yearly":
      return { size: "large", fameLevel: "legendary", artType: "yearly" };
    
    case "long_term":
      return { size: "masterpiece", fameLevel: "legendary", artType: "masterpiece" };
    
    default:
      return { size: "small", fameLevel: "common", artType: "daily" };
  }
}

/**
 * Generate art piece based on size and fame level
 */
export function generateArtPiece(
  size: ArtSize,
  fameLevel: FameLevel,
  artType: ArtType,
  completionPercentage: number = 100
): ArtData {
  // Base complexity increases with size and fame
  const complexityMap: Record<ArtSize, number> = {
    small: 10,
    medium: 25,
    large: 50,
    masterpiece: 100,
  };

  const fameMultiplier: Record<FameLevel, number> = {
    common: 1,
    uncommon: 1.5,
    rare: 2,
    epic: 3,
    legendary: 4,
  };

  const baseComplexity = complexityMap[size];
  const complexity = Math.floor(baseComplexity * fameMultiplier[fameLevel] * (completionPercentage / 100));

  // Color palette based on fame level
  const colors = getColorPalette(fameLevel, completionPercentage);

  // Generate elements based on complexity
  const elements = generateElements(complexity, size, fameLevel, completionPercentage);

  return {
    complexity,
    colors,
    elements,
    animations: size !== "small", // Only animate medium+ pieces
  };
}

/**
 * Get color palette based on fame level
 */
function getColorPalette(fameLevel: FameLevel, completionPercentage: number): ColorPalette {
  const palettes: Record<FameLevel, ColorPalette> = {
    common: {
      sky: "#1e1b4b",
      stars: "#6366f1",
      swirl: "#4f46e5",
      accent: "#818cf8",
      moon: "#c7d2fe",
    },
    uncommon: {
      sky: "#1e3a8a",
      stars: "#3b82f6",
      swirl: "#2563eb",
      accent: "#60a5fa",
      moon: "#dbeafe",
    },
    rare: {
      sky: "#312e81",
      stars: "#8b5cf6",
      swirl: "#7c3aed",
      accent: "#a78bfa",
      moon: "#e9d5ff",
    },
    epic: {
      sky: "#1e293b",
      stars: "#fbbf24",
      swirl: "#f59e0b",
      accent: "#fcd34d",
      moon: "#fef3c7",
    },
    legendary: {
      sky: "#0f172a",
      stars: "#ec4899",
      swirl: "#f472b6",
      accent: "#fbcfe8",
      moon: "#fce7f3",
    },
  };

  const palette = palettes[fameLevel];
  
  // Adjust opacity based on completion percentage for long-term goals
  if (completionPercentage < 100) {
    return {
      ...palette,
      // Fade colors slightly if not complete
      stars: adjustOpacity(palette.stars, completionPercentage / 100),
      swirl: adjustOpacity(palette.swirl, completionPercentage / 100),
    };
  }

  return palette;
}

function adjustOpacity(color: string, opacity: number): string {
  // Convert hex to rgba
  const hex = color.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

/**
 * Generate art elements (stars, swirls, etc.)
 */
function generateElements(
  complexity: number,
  size: ArtSize,
  fameLevel: FameLevel,
  completionPercentage: number
): ArtElement[] {
  const elements: ArtElement[] = [];
  const viewBox = { width: 400, height: 400 };

  // Stars - more stars for higher complexity
  const starCount = Math.floor(complexity * 0.5);
  for (let i = 0; i < starCount; i++) {
    const angle = (i * 137.5) % 360; // Golden angle distribution
    const radius = 50 + (i % 8) * 30;
    const x = 200 + radius * Math.cos((angle * Math.PI) / 180);
    const y = 200 + radius * Math.sin((angle * Math.PI) / 180);
    
    elements.push({
      type: "star",
      x: Math.max(10, Math.min(390, x)),
      y: Math.max(10, Math.min(390, y)),
      size: 1 + (i % 4) * 0.5 + (fameLevel === "legendary" ? 1.5 : 0),
      color: i % 3 === 0 ? "accent" : "stars",
      opacity: 0.6 + (i % 3) * 0.2,
    });
  }

  // Swirls - more complex for higher levels
  if (size !== "small") {
    const swirlCount = Math.floor(complexity / 10);
    for (let i = 0; i < swirlCount; i++) {
      const angle = (i * 360) / swirlCount;
      const radius = 60 + (i % 4) * 20;
      const x = 200 + radius * Math.cos((angle * Math.PI) / 180);
      const y = 200 + radius * Math.sin((angle * Math.PI) / 180);
      
      elements.push({
        type: "swirl",
        x,
        y,
        size: 20 + (fameLevel === "legendary" ? 30 : 0),
        color: "swirl",
        opacity: 0.4 + (completionPercentage / 100) * 0.3,
      });
    }
  }

  // Moon - appears in medium+ pieces
  if (size !== "small" && completionPercentage >= 30) {
    elements.push({
      type: "moon",
      x: 320,
      y: 80,
      size: 20 + (fameLevel === "legendary" ? 10 : 0),
      color: "moon",
      opacity: 0.7 + (completionPercentage / 100) * 0.2,
    });
  }

  // Constellations - only for large/masterpiece
  if (size === "large" || size === "masterpiece") {
    const constellationCount = Math.floor(complexity / 20);
    for (let i = 0; i < constellationCount; i++) {
      const baseX = 100 + (i % 3) * 100;
      const baseY = 150 + (i % 2) * 100;
      
      elements.push({
        type: "constellation",
        x: baseX,
        y: baseY,
        size: 30,
        color: "accent",
        opacity: 0.4 * (completionPercentage / 100),
      });
    }
  }

  // Glow effects - for epic+ pieces
  if (fameLevel === "epic" || fameLevel === "legendary") {
    elements.push({
      type: "glow",
      x: 200,
      y: 200,
      size: 100 + (fameLevel === "legendary" ? 50 : 0),
      color: "swirl",
      opacity: 0.2 * (completionPercentage / 100),
    });
  }

  return elements;
}

/**
 * Get art title based on type and fame level
 */
export function getArtTitle(artType: ArtType, fameLevel: FameLevel, goalTitle?: string): string {
  const titles: Record<ArtType, Record<FameLevel, string>> = {
    daily: {
      common: "Daily Star",
      uncommon: "Weekly Constellation",
      rare: "Monthly Galaxy",
      epic: "Yearly Cosmos",
      legendary: "Eternal Night",
    },
    weekly: {
      common: "Week's Beginning",
      uncommon: "Weekly Pattern",
      rare: "Monthly Rhythm",
      epic: "Yearly Cycle",
      legendary: "Timeless Flow",
    },
    monthly: {
      common: "Month's Promise",
      uncommon: "Monthly Growth",
      rare: "Quarterly Vision",
      epic: "Yearly Achievement",
      legendary: "Lifetime Legacy",
    },
    yearly: {
      common: "Year's Journey",
      uncommon: "Annual Progress",
      rare: "Yearly Milestone",
      epic: "Decade's Foundation",
      legendary: "Lifetime Achievement",
    },
    long_term: {
      common: "Future Vision",
      uncommon: "Distant Dream",
      rare: "Long-term Goal",
      epic: "Life's Masterpiece",
      legendary: "Ultimate Realization",
    },
    masterpiece: {
      common: "Masterpiece",
      uncommon: "Masterpiece",
      rare: "Masterpiece",
      epic: "Masterpiece",
      legendary: goalTitle ? `"${goalTitle}"` : "Ultimate Masterpiece",
    },
  };

  return titles[artType]?.[fameLevel] || "Art Piece";
}

/**
 * Get art description
 */
export function getArtDescription(
  artType: ArtType,
  fameLevel: FameLevel,
  completionCount: number,
  goalTitle?: string
): string {
  if (artType === "masterpiece" && goalTitle) {
    return `A masterpiece representing your journey toward "${goalTitle}". This art piece completed itself as you progressed, becoming more beautiful with each step forward.`;
  }

  const descriptions: Record<ArtType, string> = {
    daily: `Earned by completing your goal ${completionCount} time${completionCount > 1 ? "s" : ""}.`,
    weekly: `Unlocked after ${completionCount} week${completionCount > 1 ? "s" : ""} of consistency.`,
    monthly: `Achieved through ${completionCount} month${completionCount > 1 ? "s" : ""} of dedication.`,
    yearly: `A rare piece earned through a full year of commitment.`,
    long_term: `This art piece grows with your progress, becoming complete when you achieve your long-term goal.`,
    masterpiece: `Your ultimate achievement. This masterpiece represents years of dedication and growth.`,
  };

  return descriptions[artType] || "A beautiful art piece earned through your dedication.";
}

