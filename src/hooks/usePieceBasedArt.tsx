import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import {
  calculateArtPiecesFromTimeframe,
  calculateRevealedPieces,
  getRevealedPieceIndices,
  type ArtPieceConfig,
} from "@/lib/artPieceCalculator";
import { generateArtPiece } from "@/lib/artGenerator";

/**
 * Hook to manage piece-based art generation and updates
 */
export function usePieceBasedArt() {
  const { user } = useAuth();

  /**
   * Generate piece-based art for a goal when it's created
   */
  const generateArtForGoal = useCallback(
    async (goalId: string, goalTitle: string, startDate: Date, targetDate: Date | null) => {
      if (!user) return null;

      try {
        // Calculate art piece configuration
        const config = calculateArtPiecesFromTimeframe(startDate, targetDate);

        // Generate base art data (this will be the template)
        const baseArtData = generateArtPiece({
          title: goalTitle,
          progress: 0,
          grandeur: config.grandeurLevel,
        });

        // Create the art piece record with total_pieces in art_data
        const artDataWithPieces = {
          ...baseArtData,
          total_pieces: config.totalPieces,
          revealed_pieces: 0,
          revealed_piece_indices: [],
        };

        const { data: artPiece, error: artError } = await supabase
          .from("art_pieces")
          .insert({
            user_id: user.id,
            goal_id: goalId,
            art_type: config.size === "masterpiece" ? "long_term" : "yearly",
            size: config.size,
            fame_level: config.grandeurLevel === "epic" ? "legendary" : "rare",
            title: goalTitle,
            description: `A ${getGrandeurDescription(config.grandeurLevel)} with ${config.totalPieces} pieces`,
            art_data: artDataWithPieces,
            completion_percentage: 0,
          })
          .select()
          .single();

        if (artError) throw artError;

        // Update goal with art_piece_id
        await supabase
          .from("goals")
          .update({ art_piece_id: artPiece.id })
          .eq("id", goalId);

        return artPiece;
      } catch (error) {
        console.error("Error generating art for goal:", error);
        return null;
      }
    },
    [user]
  );

  /**
   * Update revealed pieces based on goal progress
   */
  const updateArtProgress = useCallback(
    async (goalId: string, progressPercentage: number) => {
      if (!user) return false;

      try {
        // Get the art piece for this goal
        const { data: artPiece, error: fetchError } = await supabase
          .from("art_pieces")
          .select("*")
          .eq("goal_id", goalId)
          .eq("user_id", user.id)
          .single();

        if (fetchError || !artPiece) {
          console.error("Art piece not found for goal:", goalId);
          return false;
        }

        // Get total_pieces from art_data
        const artData = artPiece.art_data as { total_pieces?: number } | null;
        const totalPieces = artData?.total_pieces || 1;

        // Calculate how many pieces should be revealed
        const revealedCount = calculateRevealedPieces(totalPieces, progressPercentage);

        // Get which pieces should be revealed (using seeded random for consistency)
        const revealedIndices = getRevealedPieceIndices(
          totalPieces,
          revealedCount,
          artPiece.id
        );

        // Update the art piece with revealed pieces in art_data
        const updatedArtData = {
          ...(artPiece.art_data as object),
          revealed_pieces: revealedCount,
          revealed_piece_indices: revealedIndices,
        };

        const { error: updateError } = await supabase
          .from("art_pieces")
          .update({
            art_data: updatedArtData,
            completion_percentage: progressPercentage,
          })
          .eq("id", artPiece.id);

        if (updateError) throw updateError;

        return true;
      } catch (error) {
        console.error("Error updating art progress:", error);
        return false;
      }
    },
    [user]
  );

  /**
   * Toggle public visibility of an art piece
   */
  const toggleArtVisibility = useCallback(
    async (artPieceId: string, isPublic: boolean) => {
      if (!user) return false;

      try {
        // Store visibility in art_data since is_public column doesn't exist
        const { data: artPiece } = await supabase
          .from("art_pieces")
          .select("art_data")
          .eq("id", artPieceId)
          .eq("user_id", user.id)
          .single();

        if (!artPiece) return false;

        const updatedArtData = {
          ...(artPiece.art_data as object),
          is_public: isPublic,
        };

        const { error } = await supabase
          .from("art_pieces")
          .update({ art_data: updatedArtData })
          .eq("id", artPieceId)
          .eq("user_id", user.id);

        if (error) throw error;
        return true;
      } catch (error) {
        console.error("Error toggling art visibility:", error);
        return false;
      }
    },
    [user]
  );

  return {
    generateArtForGoal,
    updateArtProgress,
    toggleArtVisibility,
  };
}

/**
 * Helper function to get grandeur description
 */
function getGrandeurDescription(grandeur: string): string {
  const descriptions: Record<string, string> = {
    tiny: "simple sketch",
    small: "small study",
    medium: "medium composition",
    large: "large work",
    grand: "grand masterpiece",
    epic: "epic masterpiece",
  };
  return descriptions[grandeur] || "art piece";
}

/**
 * Get complexity level for grandeur
 */
function getComplexityForGrandeur(grandeur: ArtPieceConfig["grandeurLevel"]): number {
  const complexityMap: Record<string, number> = {
    tiny: 1,
    small: 2,
    medium: 3,
    large: 4,
    grand: 5,
    epic: 6,
  };
  return complexityMap[grandeur] || 1;
}
