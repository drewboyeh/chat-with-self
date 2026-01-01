/**
 * Calculates the number of art pieces based on goal timeframe
 * and determines which pieces should be revealed based on progress
 */

export interface ArtPieceConfig {
  totalPieces: number;
  grandeurLevel: 'tiny' | 'small' | 'medium' | 'large' | 'grand' | 'epic';
  size: 'small' | 'medium' | 'large' | 'masterpiece';
}

/**
 * Calculate art piece configuration based on goal timeframe
 */
export function calculateArtPiecesFromTimeframe(
  startDate: Date,
  targetDate: Date | null
): ArtPieceConfig {
  if (!targetDate) {
    // No target date = daily goal = 1 piece
    return {
      totalPieces: 1,
      grandeurLevel: 'tiny',
      size: 'small',
    };
  }

  const daysDiff = Math.ceil((targetDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

  // Determine piece count and grandeur based on timeframe
  if (daysDiff <= 1) {
    // Daily: 1 piece
    return {
      totalPieces: 1,
      grandeurLevel: 'tiny',
      size: 'small',
    };
  } else if (daysDiff <= 7) {
    // 2 days - 1 week: 4 pieces
    return {
      totalPieces: 4,
      grandeurLevel: 'small',
      size: 'small',
    };
  } else if (daysDiff <= 14) {
    // 1-2 weeks: 10 pieces
    return {
      totalPieces: 10,
      grandeurLevel: 'small',
      size: 'small',
    };
  } else if (daysDiff <= 30) {
    // 2 weeks - 1 month: 25 pieces
    return {
      totalPieces: 25,
      grandeurLevel: 'medium',
      size: 'small',
    };
  } else if (daysDiff <= 90) {
    // 1-3 months: 50 pieces
    return {
      totalPieces: 50,
      grandeurLevel: 'medium',
      size: 'medium',
    };
  } else if (daysDiff <= 180) {
    // 3-6 months: 100 pieces
    return {
      totalPieces: 100,
      grandeurLevel: 'large',
      size: 'medium',
    };
  } else if (daysDiff <= 365) {
    // 6 months - 1 year: 250 pieces
    return {
      totalPieces: 250,
      grandeurLevel: 'grand',
      size: 'large',
    };
  } else {
    // 1-2 years: 500 pieces
    return {
      totalPieces: 500,
      grandeurLevel: 'epic',
      size: 'masterpiece',
    };
  }
}

/**
 * Calculate how many pieces should be revealed based on progress percentage
 */
export function calculateRevealedPieces(
  totalPieces: number,
  progressPercentage: number
): number {
  return Math.floor((totalPieces * progressPercentage) / 100);
}

/**
 * Get random piece indices to reveal (ensures consistent reveal order)
 * Uses a seeded random approach based on art_piece_id for consistency
 */
export function getRevealedPieceIndices(
  totalPieces: number,
  revealedCount: number,
  seed: string // art_piece_id or goal_id for consistency
): number[] {
  if (revealedCount >= totalPieces) {
    return Array.from({ length: totalPieces }, (_, i) => i);
  }

  // Create a seeded random number generator
  const seededRandom = (seed: string, index: number) => {
    let hash = 0;
    const str = `${seed}-${index}`;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash) / 2147483647; // Normalize to 0-1
  };

  // Create array of all indices with their "random" values
  const indicesWithValues = Array.from({ length: totalPieces }, (_, i) => ({
    index: i,
    value: seededRandom(seed, i),
  }));

  // Sort by random value and take first N
  indicesWithValues.sort((a, b) => a.value - b.value);

  // Return the first N indices
  return indicesWithValues.slice(0, revealedCount).map((item) => item.index).sort((a, b) => a - b);
}

/**
 * Get grandeur description for display
 */
export function getGrandeurDescription(grandeurLevel: ArtPieceConfig['grandeurLevel']): string {
  const descriptions = {
    tiny: 'Simple sketch',
    small: 'Small study',
    medium: 'Medium composition',
    large: 'Large work',
    grand: 'Grand masterpiece',
    epic: 'Epic masterpiece',
  };
  return descriptions[grandeurLevel];
}

