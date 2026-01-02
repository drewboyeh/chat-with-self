# Piece-Based Progressive Art System - Implementation Guide

## Overview
Art pieces are now made up of multiple "pieces" that reveal progressively as goals progress. The number of pieces and their grandeur depends on the goal timeframe.

## Piece Count by Timeframe

- **Daily (1 day)**: 1 piece
- **2 days - 1 week**: 4 pieces
- **1-2 weeks**: 10 pieces
- **2 weeks - 1 month**: 25 pieces
- **1-3 months**: 50 pieces
- **3-6 months**: 100 pieces
- **6 months - 1 year**: 250 pieces
- **1-2 years**: 500 pieces

## How It Works

1. **Goal Creation**: When a goal is created, the system:
   - Calculates the number of pieces based on timeframe
   - Generates a base art piece
   - Creates individual piece components (stored in `art_piece_components`)
   - Links the art piece to the goal

2. **Progress Updates**: When goal progress changes:
   - System calculates how many pieces should be revealed (based on progress %)
   - Uses seeded random to determine which pieces to reveal (consistent)
   - Updates the `revealed_piece_indices` array
   - Art renderer shows only the revealed pieces

3. **Art Rendering**: 
   - Art renderer fetches revealed piece components
   - Displays them in a grid layout
   - Shows completion percentage and piece count

## Database Schema

### New Columns in `art_pieces`:
- `total_pieces`: INTEGER - Total number of pieces (1, 4, 10, 25, 50, 100, 250, 500)
- `revealed_pieces`: INTEGER - How many pieces are currently revealed
- `is_public`: BOOLEAN - Whether the art is visible to others
- `revealed_piece_indices`: INTEGER[] - Which specific pieces are revealed

### New Table: `art_piece_components`
- Stores individual piece data
- Each piece has: `piece_index`, `component_data`, `grandeur_level`

## Social Features

- Users can make art pieces public (`is_public = true`)
- Public art pieces show the total piece count (e.g., "500 pieces")
- Others can view public art in a gallery
- Art pieces display their size/grandeur level

## Next Steps

1. ✅ Database schema created (`PIECE_BASED_ART_SYSTEM.sql`)
2. ✅ Art piece calculator (`src/lib/artPieceCalculator.ts`)
3. ✅ Art generator (`src/lib/artGenerator.ts`)
4. ✅ Hook for managing piece-based art (`src/hooks/usePieceBasedArt.tsx`)
5. ⏳ Create piece-based art renderer component
6. ⏳ Update goal creation to use piece-based system
7. ⏳ Update goal progress updates to reveal pieces
8. ⏳ Create social gallery component
9. ⏳ Add UI for toggling art visibility

## Usage Example

```typescript
// When creating a goal
const { generateArtForGoal } = usePieceBasedArt();
await generateArtForGoal(goalId, goalTitle, startDate, targetDate);

// When updating goal progress
const { updateArtProgress } = usePieceBasedArt();
await updateArtProgress(goalId, progressPercentage);

// Toggle public visibility
const { toggleArtVisibility } = usePieceBasedArt();
await toggleArtVisibility(artPieceId, true);
```

