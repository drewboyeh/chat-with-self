import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface GoalArtPiece {
  id: string;
  goal_id: string | null;
  art_type: "daily" | "weekly" | "monthly" | "yearly" | "long_term" | "masterpiece";
  size: "small" | "medium" | "large" | "masterpiece";
  fame_level: "common" | "uncommon" | "rare" | "epic" | "legendary";
  title: string;
  description: string | null;
  art_data: any;
  completion_percentage: number;
  unlocked_at: string;
  goal_title?: string;
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

  useEffect(() => {
    fetchArtPieces();
  }, [fetchArtPieces]);

  return {
    artPieces,
    isLoading,
    refreshArt: fetchArtPieces,
  };
}

