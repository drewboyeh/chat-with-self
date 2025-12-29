import { useState, useEffect } from "react";
import { useAuth } from "./useAuth";
import { supabase } from "@/integrations/supabase/client";

interface MoodEntry {
  id: string;
  mood: string;
  mood_score: number;
  note: string | null;
  created_at: string;
}

export function useMoods() {
  const { user } = useAuth();
  const [moods, setMoods] = useState<MoodEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [todayMood, setTodayMood] = useState<MoodEntry | null>(null);

  const logMood = async (mood: string, moodScore: number, note?: string) => {
    if (!user) {
      console.error("User not authenticated");
      return false;
    }

    try {
      // Check if user already logged a mood today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStart = today.toISOString();
      const todayEnd = new Date(today);
      todayEnd.setHours(23, 59, 59, 999);
      const todayEndISO = todayEnd.toISOString();

      const { data: existingMood } = await supabase
        .from("mood_entries")
        .select("*")
        .eq("user_id", user.id)
        .gte("created_at", todayStart)
        .lte("created_at", todayEndISO)
        .single();

      let result;
      if (existingMood) {
        // Update existing mood for today
        const { data, error } = await supabase
          .from("mood_entries")
          .update({
            mood,
            mood_score: moodScore,
            note: note || null,
          })
          .eq("id", existingMood.id)
          .select()
          .single();

        if (error) throw error;
        result = data;
      } else {
        // Insert new mood entry
        const { data, error } = await supabase
          .from("mood_entries")
          .insert({
            user_id: user.id,
            mood,
            mood_score: moodScore,
            note: note || null,
          })
          .select()
          .single();

        if (error) throw error;
        result = data;
      }

      // Refresh moods after logging
      await fetchMoods();
      return true;
    } catch (error) {
      console.error("Error logging mood:", error);
      return false;
    }
  };

  const fetchMoods = async () => {
    if (!user) {
      setMoods([]);
      setTodayMood(null);
      return;
    }

    setIsLoading(true);
    try {
      // Fetch all moods for the user, ordered by date
      const { data, error } = await supabase
        .from("mood_entries")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setMoods(data || []);

      // Find today's mood
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStart = today.toISOString();
      const todayEnd = new Date(today);
      todayEnd.setHours(23, 59, 59, 999);
      const todayEndISO = todayEnd.toISOString();

      const todayMoodEntry = (data || []).find(
        (mood) =>
          mood.created_at >= todayStart && mood.created_at <= todayEndISO
      );

      setTodayMood(todayMoodEntry || null);
    } catch (error) {
      console.error("Error fetching moods:", error);
      setMoods([]);
      setTodayMood(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchMoods();
    }
  }, [user]);

  return {
    moods,
    todayMood,
    isLoading,
    logMood,
    refreshMoods: fetchMoods,
  };
}
