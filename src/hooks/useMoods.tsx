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
  const [isLoading, setIsLoading] = useState(true);
  const [todayMood, setTodayMood] = useState<MoodEntry | null>(null);

  const fetchMoods = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("mood_entries")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(30);

      if (error) {
        console.error("Error fetching moods:", error);
      } else {
        setMoods(data || []);
        
        // Check if there's a mood logged today
        const today = new Date().toDateString();
        const todayEntry = data?.find(
          (m) => new Date(m.created_at).toDateString() === today
        );
        setTodayMood(todayEntry || null);
      }
    } catch (error) {
      console.error("Error fetching moods:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const logMood = async (mood: string, moodScore: number, note?: string) => {
    if (!user) return null;

    try {
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

      if (error) {
        console.error("Error logging mood:", error);
        return null;
      }

      setMoods((prev) => [data, ...prev]);
      setTodayMood(data);
      return data;
    } catch (error) {
      console.error("Error logging mood:", error);
      return null;
    }
  };

  useEffect(() => {
    fetchMoods();
  }, [user]);

  return {
    moods,
    todayMood,
    isLoading,
    logMood,
    refreshMoods: fetchMoods,
  };
}
