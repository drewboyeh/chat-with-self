import { useState, useEffect } from "react";
import { useAuth } from "./useAuth";
import { supabase } from "@/integrations/supabase/client";

interface StreakData {
  current_streak: number;
  longest_streak: number;
  last_journal_date: string | null;
}

export function useStreak() {
  const { user } = useAuth();
  const [streak, setStreak] = useState<StreakData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch streak data
  const fetchStreak = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("user_streaks")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        // PGRST116 is "not found" - that's okay, we'll create it
        console.error("Error fetching streak:", error);
      }

      if (data) {
        setStreak({
          current_streak: data.current_streak || 0,
          longest_streak: data.longest_streak || 0,
          last_journal_date: data.last_journal_date,
        });
      } else {
        // Initialize streak if it doesn't exist
        setStreak({
          current_streak: 0,
          longest_streak: 0,
          last_journal_date: null,
        });
      }
    } catch (error) {
      console.error("Error fetching streak:", error);
      setStreak({
        current_streak: 0,
        longest_streak: 0,
        last_journal_date: null,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Update streak when a new journal entry is created
  const updateStreak = async () => {
    if (!user) return;

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStr = today.toISOString().split("T")[0];

      // Get current streak data
      const { data: existingStreak } = await supabase
        .from("user_streaks")
        .select("*")
        .eq("user_id", user.id)
        .single();

      let currentStreak = 0;
      let longestStreak = 0;
      let lastJournalDate: string | null = null;

      if (existingStreak) {
        currentStreak = existingStreak.current_streak || 0;
        longestStreak = existingStreak.longest_streak || 0;
        lastJournalDate = existingStreak.last_journal_date;
      }

      // Calculate new streak
      if (lastJournalDate) {
        const lastDate = new Date(lastJournalDate);
        lastDate.setHours(0, 0, 0, 0);
        const daysDiff = Math.floor(
          (today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysDiff === 0) {
          // Same day - don't update streak
          return;
        } else if (daysDiff === 1) {
          // Consecutive day - increment streak
          currentStreak += 1;
        } else {
          // Streak broken - reset to 1
          currentStreak = 1;
        }
      } else {
        // First journal entry
        currentStreak = 1;
      }

      // Update longest streak if needed
      if (currentStreak > longestStreak) {
        longestStreak = currentStreak;
      }

      // Upsert streak data
      const { error } = await supabase
        .from("user_streaks")
        .upsert(
          {
            user_id: user.id,
            current_streak: currentStreak,
            longest_streak: longestStreak,
            last_journal_date: todayStr,
          },
          {
            onConflict: "user_id",
          }
        );

      if (error) {
        console.error("Error updating streak:", error);
      } else {
        // Update local state
        setStreak({
          current_streak: currentStreak,
          longest_streak: longestStreak,
          last_journal_date: todayStr,
        });

        // Show celebration for milestones
        if ([7, 30, 50, 100, 365].includes(currentStreak)) {
          return {
            milestone: currentStreak,
            message: getMilestoneMessage(currentStreak),
          };
        }
      }
    } catch (error) {
      console.error("Error updating streak:", error);
    }

    return null;
  };

  useEffect(() => {
    fetchStreak();
  }, [user]);

  return {
    streak,
    isLoading,
    updateStreak,
    refreshStreak: fetchStreak,
  };
}

function getMilestoneMessage(days: number): string {
  const messages: { [key: number]: string } = {
    7: "🔥 7 days! You're building a habit!",
    30: "🌟 30 days! You're unstoppable!",
    50: "💪 50 days! You're a journaling champion!",
    100: "🎉 100 days! Incredible dedication!",
    365: "🏆 365 days! A full year of reflection!",
  };
  return messages[days] || `🎊 ${days} days! Keep going!`;
}


