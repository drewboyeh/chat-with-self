/**
 * Art Generator - Creates original abstract art pieces
 * Generates unique art based on goal progress, grandeur level, and other parameters
 */

export interface ArtGenerationParams {
  title: string;
  progress: number;
  grandeur: 'tiny' | 'small' | 'medium' | 'large' | 'grand' | 'epic';
  seed?: string; // For consistent generation
}

export interface ArtData {
  colors: {
    sky: string;
    stars: string;
    swirl: string;
    accent: string;
    moon: string;
  };
  complexity: number;
  elements: Array<{
    type: 'star' | 'swirl' | 'moon' | 'constellation' | 'glow';
    x: number;
    y: number;
    size?: number;
    opacity?: number;
    color?: string;
  }>;
  animations?: boolean;
}

/**
 * Generate a base art piece
 */
export function generateArtPiece(params: ArtGenerationParams): ArtData {
  const { progress, grandeur, seed = Math.random().toString() } = params;
  
  // Determine color palette based on progress and grandeur
  const colorPalette = getColorPalette(progress, grandeur);
  
  // Determine complexity based on grandeur
  const complexity = getComplexity(grandeur);
  
  // Generate elements based on complexity and progress
  const elements = generateElements(complexity, progress, colorPalette, seed);
  
  return {
    colors: colorPalette,
    complexity,
    elements,
    animations: progress > 50,
  };
}

/**
 * Generate a single art piece component (for piece-based art)
 */
export function generateArtPieceComponent(
  index: number,
  totalPieces: number,
  grandeur: 'tiny' | 'small' | 'medium' | 'large' | 'grand' | 'epic',
  baseArtData: ArtData,
  seed: string
): ArtData {
  // Calculate position in the overall composition
  const gridSize = Math.ceil(Math.sqrt(totalPieces));
  const x = (index % gridSize) / gridSize;
  const y = Math.floor(index / gridSize) / gridSize;
  
  // Determine if this is a center piece (more complex)
  const centerDistance = Math.sqrt(
    Math.pow(x - 0.5, 2) + Math.pow(y - 0.5, 2)
  );
  const isCenter = centerDistance < 0.2;
  
  // Generate component-specific elements
  const componentElements = generateComponentElements(
    index,
    totalPieces,
    grandeur,
    isCenter,
    baseArtData,
    seed
  );
  
  return {
    colors: baseArtData.colors,
    complexity: isCenter ? baseArtData.complexity : Math.max(1, baseArtData.complexity - 2),
    elements: componentElements,
    animations: isCenter && index % 10 === 0, // Animate some center pieces
  };
}

/**
 * Get color palette based on progress and grandeur
 */
function getColorPalette(
  progress: number,
  grandeur: 'tiny' | 'small' | 'medium' | 'large' | 'grand' | 'epic'
): ArtData['colors'] {
  // Base palette shifts with progress
  const progressStage = Math.floor(progress / 20);
  
  const palettes: Record<number, ArtData['colors']> = {
    0: { sky: "#1e1b4b", stars: "#6366f1", swirl: "#4f46e5", accent: "#818cf8", moon: "#c7d2fe" }, // Indigo/Purple
    1: { sky: "#1e3a8a", stars: "#3b82f6", swirl: "#2563eb", accent: "#60a5fa", moon: "#93c5fd" }, // Blue
    2: { sky: "#064e3b", stars: "#10b981", swirl: "#059669", accent: "#34d399", moon: "#6ee7b7" }, // Green
    3: { sky: "#78350f", stars: "#f59e0b", swirl: "#d97706", accent: "#fbbf24", moon: "#fcd34d" }, // Amber/Gold
    4: { sky: "#831843", stars: "#ec4899", swirl: "#db2777", accent: "#f472b6", moon: "#fbcfe8" }, // Pink/Magenta
  };
  
  const basePalette = palettes[Math.min(progressStage, 4)] || palettes[0];
  
  // Enhance colors for higher grandeur
  if (grandeur === 'epic' || grandeur === 'grand') {
    return {
      ...basePalette,
      stars: lightenColor(basePalette.stars, 0.2),
      accent: lightenColor(basePalette.accent, 0.3),
    };
  }
  
  return basePalette;
}

/**
 * Get complexity based on grandeur
 */
function getComplexity(grandeur: 'tiny' | 'small' | 'medium' | 'large' | 'grand' | 'epic'): number {
  const complexityMap = {
    tiny: 5,
    small: 10,
    medium: 20,
    large: 40,
    grand: 80,
    epic: 150,
  };
  return complexityMap[grandeur];
}

/**
 * Generate art elements
 */
function generateElements(
  complexity: number,
  progress: number,
  colors: ArtData['colors'],
  seed: string
): ArtData['elements'] {
  const elements: ArtData['elements'] = [];
  const seededRandom = createSeededRandom(seed);
  
  // Add stars
  const starCount = Math.floor(complexity * 0.3);
  for (let i = 0; i < starCount; i++) {
    elements.push({
      type: 'star',
      x: seededRandom() * 400,
      y: seededRandom() * 400,
      size: 1 + seededRandom() * 4,
      opacity: 0.6 + seededRandom() * 0.4,
    });
  }
  
  // Add swirls (more as progress increases)
  const swirlCount = Math.floor(complexity * 0.2 * (progress / 100));
  for (let i = 0; i < swirlCount; i++) {
    elements.push({
      type: 'swirl',
      x: seededRandom() * 400,
      y: seededRandom() * 400,
      opacity: 0.3 + seededRandom() * 0.3,
    });
  }
  
  // Add moon (if progress > 30%)
  if (progress > 30 && seededRandom() > 0.7) {
    elements.push({
      type: 'moon',
      x: 50 + seededRandom() * 100,
      y: 50 + seededRandom() * 100,
      size: 15 + seededRandom() * 10,
      opacity: 0.7 + seededRandom() * 0.2,
    });
  }
  
  // Add constellations (if progress > 50%)
  if (progress > 50) {
    const constellationCount = Math.floor(complexity * 0.1);
    for (let i = 0; i < constellationCount; i++) {
      elements.push({
        type: 'constellation',
        x: seededRandom() * 400,
        y: seededRandom() * 400,
        opacity: 0.4 + seededRandom() * 0.3,
      });
    }
  }
  
  // Add glow (if progress > 70%)
  if (progress > 70) {
    elements.push({
      type: 'glow',
      x: 200,
      y: 200,
      size: 80 + seededRandom() * 40,
      opacity: 0.2 + seededRandom() * 0.2,
    });
  }
  
  return elements;
}

/**
 * Generate component-specific elements for piece-based art
 */
function generateComponentElements(
  index: number,
  totalPieces: number,
  grandeur: 'tiny' | 'small' | 'medium' | 'large' | 'grand' | 'epic',
  isCenter: boolean,
  baseArtData: ArtData,
  seed: string
): ArtData['elements'] {
  const elements: ArtData['elements'] = [];
  const seededRandom = createSeededRandom(`${seed}-${index}`);
  const gridSize = Math.ceil(Math.sqrt(totalPieces));
  const pieceWidth = 400 / gridSize;
  const pieceHeight = 400 / gridSize;
  const xOffset = (index % gridSize) * pieceWidth;
  const yOffset = Math.floor(index / gridSize) * pieceHeight;
  
  // Center pieces get more elements
  const elementCount = isCenter ? 5 + Math.floor(seededRandom() * 5) : 1 + Math.floor(seededRandom() * 3);
  
  for (let i = 0; i < elementCount; i++) {
    const elementType = isCenter && seededRandom() > 0.5 ? 'star' : 'swirl';
    elements.push({
      type: elementType,
      x: xOffset + seededRandom() * pieceWidth,
      y: yOffset + seededRandom() * pieceHeight,
      size: elementType === 'star' ? 1 + seededRandom() * 3 : undefined,
      opacity: 0.4 + seededRandom() * 0.4,
    });
  }
  
  return elements;
}

/**
 * Create a seeded random number generator
 */
function createSeededRandom(seed: string): () => number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  let value = Math.abs(hash) / 2147483647;
  
  return () => {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
}

/**
 * Lighten a hex color
 */
function lightenColor(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, ((num >> 16) & 0xff) + Math.floor(255 * amount));
  const g = Math.min(255, ((num >> 8) & 0xff) + Math.floor(255 * amount));
  const b = Math.min(255, (num & 0xff) + Math.floor(255 * amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

