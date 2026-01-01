import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import {
  calculateArtPiecesFromTimeframe,
  calculateRevealedPieces,
  getRevealedPieceIndices,
  type ArtPieceConfig,
} from "@/lib/artPieceCalculator";
import { generateArtPiece, generateArtPieceComponent } from "@/lib/artGenerator";

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

        // Create the art piece record
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
            art_data: baseArtData,
            total_pieces: config.totalPieces,
            revealed_pieces: 0,
            revealed_piece_indices: [],
            completion_percentage: 0,
            is_public: false,
          })
          .select()
          .single();

        if (artError) throw artError;

        // Generate individual piece components
        const pieceComponents = [];
        for (let i = 0; i < config.totalPieces; i++) {
          // Generate a unique piece component based on index and grandeur
          const pieceData = generateArtPieceComponent(
            i,
            config.totalPieces,
            config.grandeurLevel,
            baseArtData,
            artPiece.id
          );

          pieceComponents.push({
            art_piece_id: artPiece.id,
            piece_index: i,
            component_data: pieceData,
            grandeur_level: getPieceGrandeur(i, config.totalPieces, config.grandeurLevel),
          });
        }

        // Insert all piece components
        const { error: componentsError } = await supabase
          .from("art_piece_components")
          .insert(pieceComponents);

        if (componentsError) throw componentsError;

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

        // Calculate how many pieces should be revealed
        const revealedCount = calculateRevealedPieces(artPiece.total_pieces, progressPercentage);

        // Get which pieces should be revealed (using seeded random for consistency)
        const revealedIndices = getRevealedPieceIndices(
          artPiece.total_pieces,
          revealedCount,
          artPiece.id
        );

        // Update the art piece
        const { error: updateError } = await supabase
          .from("art_pieces")
          .update({
            revealed_pieces: revealedCount,
            revealed_piece_indices: revealedIndices,
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
        const { error } = await supabase
          .from("art_pieces")
          .update({ is_public: isPublic })
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
 * Generate an individual art piece component
 */
function generateArtPieceComponent({
  index,
  totalPieces,
  grandeur,
  baseArtData,
}: {
  index: number;
  totalPieces: number;
  grandeur: ArtPieceConfig["grandeurLevel"];
  baseArtData: any;
}): any {
  // This would generate a unique piece component
  // For now, return a placeholder structure
  // In production, this would use the art generator to create unique pieces
  return {
    type: "component",
    index,
    position: {
      x: (index % Math.sqrt(totalPieces)) * 10,
      y: Math.floor(index / Math.sqrt(totalPieces)) * 10,
    },
    data: baseArtData,
    complexity: getComplexityForGrandeur(grandeur),
  };
}

/**
 * Get piece grandeur level based on position and total pieces
 */
function getPieceGrandeur(
  index: number,
  totalPieces: number,
  baseGrandeur: ArtPieceConfig["grandeurLevel"]
): string {
  // Center pieces are more grand
  const centerDistance = Math.abs(index - totalPieces / 2) / (totalPieces / 2);
  
  if (centerDistance < 0.1) return "epic";
  if (centerDistance < 0.3) return "grand";
  if (centerDistance < 0.5) return "large";
  if (centerDistance < 0.7) return "medium";
  return "small";
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

