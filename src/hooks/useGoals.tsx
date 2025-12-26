import { useState, useEffect } from "react";
import { useAuth } from "./useAuth";
import { supabase } from "@/integrations/supabase/client";

export interface Goal {
  id: string;
  title: string;
  description: string | null;
  category: string;
  status: string;
  target_date: string | null;
  progress: number;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export function useGoals() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchGoals = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("goals")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching goals:", error);
      } else {
        setGoals(data || []);
      }
    } catch (error) {
      console.error("Error fetching goals:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const createGoal = async (
    title: string,
    category: string,
    description?: string,
    targetDate?: string
  ) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from("goals")
        .insert({
          user_id: user.id,
          title,
          category,
          description: description || null,
          target_date: targetDate || null,
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating goal:", error);
        return null;
      }

      setGoals((prev) => [data, ...prev]);
      return data;
    } catch (error) {
      console.error("Error creating goal:", error);
      return null;
    }
  };

  const updateGoalProgress = async (goalId: string, progress: number) => {
    if (!user) return false;

    try {
      const updates: Partial<Goal> = { progress };
      if (progress >= 100) {
        updates.status = "completed";
        updates.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("goals")
        .update(updates)
        .eq("id", goalId)
        .eq("user_id", user.id);

      if (error) {
        console.error("Error updating goal:", error);
        return false;
      }

      setGoals((prev) =>
        prev.map((g) => (g.id === goalId ? { ...g, ...updates } : g))
      );
      return true;
    } catch (error) {
      console.error("Error updating goal:", error);
      return false;
    }
  };

  const deleteGoal = async (goalId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from("goals")
        .delete()
        .eq("id", goalId)
        .eq("user_id", user.id);

      if (error) {
        console.error("Error deleting goal:", error);
        return false;
      }

      setGoals((prev) => prev.filter((g) => g.id !== goalId));
      return true;
    } catch (error) {
      console.error("Error deleting goal:", error);
      return false;
    }
  };

  useEffect(() => {
    fetchGoals();
  }, [user]);

  return {
    goals,
    activeGoals: goals.filter((g) => g.status === "active"),
    completedGoals: goals.filter((g) => g.status === "completed"),
    isLoading,
    createGoal,
    updateGoalProgress,
    deleteGoal,
    refreshGoals: fetchGoals,
  };
}
