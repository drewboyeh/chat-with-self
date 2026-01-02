import { useState, useEffect } from "react";
import { useAuth } from "./useAuth";

// Note: mood_entries table doesn't exist yet - this hook is disabled until the table is created
// To enable, create the mood_entries table with columns: id, user_id, mood, mood_score, note, created_at

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

  // Disabled - mood_entries table doesn't exist
  const logMood = async (mood: string, moodScore: number, note?: string) => {
    console.warn("Mood tracking is disabled - mood_entries table not found");
    return false;
  };

  const fetchMoods = async () => {
    // Disabled - table doesn't exist
    setMoods([]);
    setTodayMood(null);
    setIsLoading(false);
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
