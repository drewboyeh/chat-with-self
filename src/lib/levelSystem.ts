/**
 * Leveling System
 * Converts total points into user levels with exponential progression
 */

export interface LevelInfo {
  level: number;
  currentLevelPoints: number;
  nextLevelPoints: number;
  pointsInCurrentLevel: number;
  pointsNeededForNext: number;
  progressPercent: number;
}

/**
 * Calculate level based on total points
 * Uses exponential progression: Level = floor(sqrt(points / 100)) + 1
 * This means:
 * - Level 1: 0-99 points
 * - Level 2: 100-399 points
 * - Level 3: 400-899 points
 * - Level 4: 900-1599 points
 * - Level 5: 1600-2499 points
 * - And so on...
 */
export function calculateLevel(totalPoints: number): number {
  if (totalPoints < 0) return 1;
  // Exponential progression: each level requires more points
  // Formula: level = floor(sqrt(points / 100)) + 1
  const level = Math.floor(Math.sqrt(totalPoints / 100)) + 1;
  return Math.max(1, level); // Minimum level is 1
}

/**
 * Get points required for a specific level
 */
export function getPointsForLevel(level: number): number {
  if (level <= 1) return 0;
  // Reverse of calculateLevel: points = (level - 1)^2 * 100
  return Math.pow(level - 1, 2) * 100;
}

/**
 * Get points required for next level
 */
export function getPointsForNextLevel(currentLevel: number): number {
  return getPointsForLevel(currentLevel + 1);
}

/**
 * Get complete level information
 */
export function getLevelInfo(totalPoints: number): LevelInfo {
  const level = calculateLevel(totalPoints);
  const currentLevelPoints = getPointsForLevel(level);
  const nextLevelPoints = getPointsForLevel(level + 1);
  const pointsInCurrentLevel = totalPoints - currentLevelPoints;
  const pointsNeededForNext = nextLevelPoints - totalPoints;
  const progressPercent = Math.min(
    100,
    Math.max(
      0,
      (pointsInCurrentLevel / (nextLevelPoints - currentLevelPoints)) * 100
    )
  );

  return {
    level,
    currentLevelPoints,
    nextLevelPoints,
    pointsInCurrentLevel,
    pointsNeededForNext,
    progressPercent,
  };
}

/**
 * Get level title/name based on level number
 */
export function getLevelTitle(level: number): string {
  const titles: Record<number, string> = {
    1: "Beginner",
    2: "Explorer",
    3: "Learner",
    4: "Practitioner",
    5: "Achiever",
    6: "Expert",
    7: "Master",
    8: "Champion",
    9: "Legend",
    10: "Mythic",
  };

  if (level <= 10) {
    return titles[level] || `Level ${level}`;
  }

  // For levels above 10, use tier system
  if (level <= 20) return `Elite ${level - 10}`;
  if (level <= 30) return `Grandmaster ${level - 20}`;
  if (level <= 40) return `Transcendent ${level - 30}`;
  return `Divine ${level - 40}`;
}

/**
 * Get level emoji/icon based on level
 */
export function getLevelEmoji(level: number): string {
  if (level <= 5) return "🌱";
  if (level <= 10) return "⭐";
  if (level <= 15) return "🌟";
  if (level <= 20) return "💫";
  if (level <= 25) return "✨";
  if (level <= 30) return "👑";
  return "💎";
}

/**
 * Check if user leveled up
 */
export function checkLevelUp(
  oldPoints: number,
  newPoints: number
): { leveledUp: boolean; newLevel: number; oldLevel: number } {
  const oldLevel = calculateLevel(oldPoints);
  const newLevel = calculateLevel(newPoints);

  return {
    leveledUp: newLevel > oldLevel,
    newLevel,
    oldLevel,
  };
}

