import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { generateArtPiece, getArtMetadata, getArtTitle, getArtDescription, type ArtPiece, type ArtType } from "@/lib/artGenerator";

export interface GoalArtPiece {
  id: string;
  goal_id: string | null;
  art_type: ArtType;
  size: "small" | "medium" | "large" | "masterpiece";
  fame_level: "common" | "uncommon" | "rare" | "epic" | "legendary";
  title: string;
  description: string | null;
  art_data: any;
  completion_percentage: number;
  unlocked_at: string;
  goal_title?: string;
}

export interface GoalCompletion {
  id: string;
  goal_id: string;
  completed_at: string;
  completion_type: string;
}

export function useGoalArt() {
  const { user } = useAuth();
  const [artPieces, setArtPieces] = useState<GoalArtPiece[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchArtPieces = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("art_pieces")
        .select(`
          *,
          goals (title)
        `)
        .eq("user_id", user.id)
        .order("unlocked_at", { ascending: false });

      if (error) throw error;

      const formatted = (data || []).map((piece: any) => ({
        ...piece,
        goal_title: piece.goals?.title,
      }));

      setArtPieces(formatted);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching art pieces:", error);
      setIsLoading(false);
    }
  }, [user]);

  /**
   * Record goal completion and check for art piece unlock
   */
  const recordGoalCompletion = useCallback(async (
    goalId: string,
    timeframe: string,
    isRecurring: boolean = false
  ): Promise<GoalArtPiece | null> => {
    if (!user) return null;

    try {
      // Record completion
      const { error: completionError } = await supabase
        .from("goal_completions")
        .insert({
          goal_id: goalId,
          user_id: user.id,
          completion_type: timeframe,
        });

      if (completionError) throw completionError;

      // Count completions for this goal
      const { data: completions, error: countError } = await supabase
        .from("goal_completions")
        .select("id")
        .eq("goal_id", goalId)
        .eq("user_id", user.id);

      if (countError) throw countError;

      const completionCount = completions?.length || 0;

      // Get goal info
      const { data: goal, error: goalError } = await supabase
        .from("goals")
        .select("title, timeframe")
        .eq("id", goalId)
        .single();

      if (goalError) throw goalError;

      // Determine if art should be unlocked
      const metadata = getArtMetadata(timeframe, completionCount);
      
      // Check if art already exists for this milestone
      const shouldUnlock = shouldUnlockArt(timeframe, completionCount);

      if (shouldUnlock) {
        // Generate art piece
        const artData = generateArtPiece(
          metadata.size,
          metadata.fameLevel,
          metadata.artType,
          timeframe === "long_term" ? 0 : 100 // Long-term starts at 0%
        );

        const title = getArtTitle(metadata.artType, metadata.fameLevel, goal.title);
        const description = getArtDescription(
          metadata.artType,
          metadata.fameLevel,
          completionCount,
          goal.title
        );

        // Create art piece
        const { data: artPiece, error: artError } = await supabase
          .from("art_pieces")
          .insert({
            user_id: user.id,
            goal_id: goalId,
            art_type: metadata.artType,
            size: metadata.size,
            fame_level: metadata.fameLevel,
            title,
            description,
            art_data: artData,
            completion_percentage: timeframe === "long_term" ? 0 : 100,
          })
          .select()
          .single();

        if (artError) throw artError;

        // Update goal with art piece reference
        await supabase
          .from("goals")
          .update({ art_piece_id: artPiece.id })
          .eq("id", goalId);

        await fetchArtPieces();

        return {
          ...artPiece,
          goal_title: goal.title,
        };
      }

      return null;
    } catch (error) {
      console.error("Error recording goal completion:", error);
      return null;
    }
  }, [user, fetchArtPieces]);

  /**
   * Update long-term goal art completion percentage
   */
  const updateLongTermArtProgress = useCallback(async (
    goalId: string,
    progress: number
  ): Promise<boolean> => {
    if (!user) return false;

    try {
      // Get art piece for this goal
      const { data: artPiece, error: fetchError } = await supabase
        .from("art_pieces")
        .select("id, art_data, completion_percentage")
        .eq("goal_id", goalId)
        .eq("user_id", user.id)
        .single();

      if (fetchError || !artPiece) {
        // Create art piece if it doesn't exist (for long-term goals)
        const { data: goal } = await supabase
          .from("goals")
          .select("title, timeframe")
          .eq("id", goalId)
          .single();

        if (goal?.timeframe === "long_term") {
          const metadata = getArtMetadata("long_term");
          const artData = generateArtPiece(
            metadata.size,
            metadata.fameLevel,
            metadata.artType,
            progress
          );

          const title = getArtTitle(metadata.artType, metadata.fameLevel, goal.title);
          const description = getArtDescription(
            metadata.artType,
            metadata.fameLevel,
            0,
            goal.title
          );

          await supabase
            .from("art_pieces")
            .insert({
              user_id: user.id,
              goal_id: goalId,
              art_type: metadata.artType,
              size: metadata.size,
              fame_level: metadata.fameLevel,
              title,
              description,
              art_data: artData,
              completion_percentage: progress,
            });
        }
        return true;
      }

      // Update existing art piece
      const updatedArtData = generateArtPiece(
        "masterpiece",
        "legendary",
        "masterpiece",
        progress
      );

      const { error: updateError } = await supabase
        .from("art_pieces")
        .update({
          completion_percentage: progress,
          art_data: updatedArtData,
        })
        .eq("id", artPiece.id);

      if (updateError) throw updateError;

      await fetchArtPieces();
      return true;
    } catch (error) {
      console.error("Error updating long-term art progress:", error);
      return false;
    }
  }, [user, fetchArtPieces]);

  /**
   * Check if art should be unlocked based on completion count
   */
  function shouldUnlockArt(timeframe: string, completionCount: number): boolean {
    switch (timeframe) {
      case "daily":
        return completionCount === 1 || // First completion
               completionCount === 7 || // Week milestone
               completionCount === 30 || // Month milestone
               completionCount === 365; // Year milestone
      
      case "weekly":
        return completionCount === 1 || // First completion
               completionCount === 12 || // 3 months
               completionCount === 52; // Year milestone
      
      case "monthly":
        return completionCount === 1 || // First completion
               completionCount === 12; // Year milestone
      
      case "yearly":
        return completionCount === 1; // Year completion
      
      case "long_term":
        return completionCount === 1; // Create art when goal is set
      
      default:
        return false;
    }
  }

  useEffect(() => {
    fetchArtPieces();
  }, [fetchArtPieces]);

  return {
    artPieces,
    isLoading,
    recordGoalCompletion,
    updateLongTermArtProgress,
    refreshArt: fetchArtPieces,
  };
}

