import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { calculateLevel, checkLevelUp, type LevelInfo } from "@/lib/levelSystem";

interface UserRewards {
  id: string;
  user_id: string;
  total_points: number;
  level: number;
  completed_reminders: number;
  completed_goals: number;
  journal_entries: number;
  current_streak: number;
  longest_streak: number;
}

interface Achievement {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: string | null;
  points: number;
  category: string;
  earned_at: string;
}

interface PointsHistory {
  id: string;
  points: number;
  source: string;
  description: string | null;
  created_at: string;
}

export function useRewards() {
  const { user } = useAuth();
  const [rewards, setRewards] = useState<UserRewards | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [recentPoints, setRecentPoints] = useState<PointsHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [levelInfo, setLevelInfo] = useState<LevelInfo | null>(null);

  const fetchRewards = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      // Get or create user rewards
      let { data: rewardsData, error: rewardsError } = await supabase
        .from("user_rewards")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (rewardsError && rewardsError.code === "PGRST116") {
        // No rewards record exists, create one
        const { data: newRewards, error: createError } = await supabase
          .from("user_rewards")
          .insert({
            user_id: user.id,
            total_points: 0,
            completed_reminders: 0,
            completed_goals: 0,
            journal_entries: 0,
            current_streak: 0,
            longest_streak: 0,
          })
          .select()
          .single();

        if (createError) throw createError;
        rewardsData = newRewards;
      } else if (rewardsError) {
        throw rewardsError;
      }

      setRewards(rewardsData);

      // Calculate level info
      if (rewardsData) {
        const { getLevelInfo } = await import("@/lib/levelSystem");
        setLevelInfo(getLevelInfo(rewardsData.total_points));
      }

      // Fetch achievements
      const { data: achievementsData, error: achievementsError } = await supabase
        .from("user_achievements")
        .select(`
          *,
          achievement_definitions (
            code,
            name,
            description,
            icon,
            points,
            category
          )
        `)
        .eq("user_id", user.id)
        .order("earned_at", { ascending: false });

      if (achievementsError) throw achievementsError;

      const formattedAchievements = (achievementsData || []).map((a: any) => ({
        id: a.id,
        code: a.achievement_definitions.code,
        name: a.achievement_definitions.name,
        description: a.achievement_definitions.description,
        icon: a.achievement_definitions.icon,
        points: a.achievement_definitions.points,
        category: a.achievement_definitions.category,
        earned_at: a.earned_at,
      }));

      setAchievements(formattedAchievements);

      // Fetch recent points history
      const { data: pointsData, error: pointsError } = await supabase
        .from("points_history")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);

      if (pointsError) throw pointsError;
      setRecentPoints(pointsData || []);

      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching rewards:", error);
      setIsLoading(false);
    }
  }, [user]);

  const awardPoints = useCallback(
    async (
      points: number,
      source: string,
      sourceId?: string,
      description?: string
    ): Promise<{ 
      success: boolean; 
      newAchievements: Achievement[];
      leveledUp: boolean;
      oldLevel: number;
      newLevel: number;
    }> => {
      if (!user || points <= 0) {
        return { 
          success: false, 
          newAchievements: [],
          leveledUp: false,
          oldLevel: 1,
          newLevel: 1,
        };
      }

      try {
        // Get current rewards to check for level up
        const { data: currentRewards } = await supabase
          .from("user_rewards")
          .select("*")
          .eq("user_id", user.id)
          .single();

        const oldPoints = currentRewards?.total_points || 0;
        const oldLevel = currentRewards?.level || calculateLevel(oldPoints);
        const newPoints = oldPoints + points;
        const newLevel = calculateLevel(newPoints);
        const leveledUp = newLevel > oldLevel;

        // Add points to user_rewards
        const { error: updateError } = await supabase.rpc("add_points", {
          p_user_id: user.id,
          p_points: points,
          p_source: source,
          p_source_id: sourceId || null,
          p_description: description || null,
        });

        // If RPC doesn't exist, do it manually
        if (updateError && updateError.message.includes("function")) {
          if (currentRewards) {
            await supabase
              .from("user_rewards")
              .update({ 
                total_points: newPoints,
                level: newLevel, // Update level
              })
              .eq("user_id", user.id);
          }

          // Add to points history
          await supabase.from("points_history").insert({
            user_id: user.id,
            points,
            source,
            source_id: sourceId || null,
            description: description || null,
          });
        } else if (leveledUp) {
          // Update level if RPC was used
          await supabase
            .from("user_rewards")
            .update({ level: newLevel })
            .eq("user_id", user.id);
        }

        // Check for new achievements
        const newAchievements = await checkAchievements();

        // Refresh rewards
        await fetchRewards();

        return { 
          success: true, 
          newAchievements,
          leveledUp,
          oldLevel,
          newLevel,
        };
      } catch (error) {
        console.error("Error awarding points:", error);
        return { 
          success: false, 
          newAchievements: [],
          leveledUp: false,
          oldLevel: 1,
          newLevel: 1,
        };
      }
    },
    [user, fetchRewards]
  );

  const checkAchievements = useCallback(async (): Promise<Achievement[]> => {
    if (!user || !rewards) return [];

    try {
      // Get all achievement definitions
      const { data: definitions, error: defError } = await supabase
        .from("achievement_definitions")
        .select("*");

      if (defError) throw defError;

      // Get user's current achievements
      const { data: userAchievements, error: achError } = await supabase
        .from("user_achievements")
        .select("achievement_id")
        .eq("user_id", user.id);

      if (achError) throw achError;

      const earnedIds = new Set((userAchievements || []).map((a) => a.achievement_id));
      const newAchievements: Achievement[] = [];

      // Check each definition
      for (const def of definitions || []) {
        if (earnedIds.has(def.id)) continue; // Already earned

        let shouldAward = false;

        switch (def.category) {
          case "reminder":
            shouldAward = rewards.completed_reminders >= def.requirement;
            break;
          case "goal":
            shouldAward = rewards.completed_goals >= def.requirement;
            break;
          case "streak":
            shouldAward = rewards.current_streak >= def.requirement;
            break;
          case "journal":
            shouldAward = rewards.journal_entries >= def.requirement;
            break;
          case "milestone":
            shouldAward = rewards.total_points >= def.requirement;
            break;
        }

        if (shouldAward) {
          // Award achievement
          const { error: insertError } = await supabase
            .from("user_achievements")
            .insert({
              user_id: user.id,
              achievement_id: def.id,
            });

          if (!insertError) {
            newAchievements.push({
              id: def.id,
              code: def.code,
              name: def.name,
              description: def.description,
              icon: def.icon,
              points: def.points,
              category: def.category,
              earned_at: new Date().toISOString(),
            });

            // Award achievement points if any
            if (def.points > 0) {
              await awardPoints(
                def.points,
                "achievement",
                def.id,
                `Achievement: ${def.name}`
              );
            }
          }
        }
      }

      return newAchievements;
    } catch (error) {
      console.error("Error checking achievements:", error);
      return [];
    }
  }, [user, rewards, awardPoints]);

  const incrementReminder = useCallback(async () => {
    if (!user) return;

    try {
      await supabase.rpc("increment_reminder_count", {
        p_user_id: user.id,
      });

      // Fallback if RPC doesn't exist
      const { data: current } = await supabase
        .from("user_rewards")
        .select("completed_reminders")
        .eq("user_id", user.id)
        .single();

      if (current) {
        await supabase
          .from("user_rewards")
          .update({ completed_reminders: current.completed_reminders + 1 })
          .eq("user_id", user.id);
      }

      await fetchRewards();
      return await checkAchievements();
    } catch (error) {
      console.error("Error incrementing reminder:", error);
      return [];
    }
  }, [user, fetchRewards, checkAchievements]);

  const incrementGoal = useCallback(async () => {
    if (!user) return;

    try {
      const { data: current } = await supabase
        .from("user_rewards")
        .select("completed_goals")
        .eq("user_id", user.id)
        .single();

      if (current) {
        await supabase
          .from("user_rewards")
          .update({ completed_goals: current.completed_goals + 1 })
          .eq("user_id", user.id);
      }

      await fetchRewards();
      return await checkAchievements();
    } catch (error) {
      console.error("Error incrementing goal:", error);
      return [];
    }
  }, [user, fetchRewards, checkAchievements]);

  useEffect(() => {
    fetchRewards();
  }, [fetchRewards]);

  return {
    rewards,
    achievements,
    recentPoints,
    isLoading,
    levelInfo,
    awardPoints,
    incrementReminder,
    incrementGoal,
    checkAchievements,
    refreshRewards: fetchRewards,
  };
}

