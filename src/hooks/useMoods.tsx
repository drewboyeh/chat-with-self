import { useState, useEffect } from "react";
import { useAuth } from "./useAuth";

interface MoodEntry {
  id: string;
  mood: string;
  mood_score: number;
  note: string | null;
  created_at: string;
}

// Mood tracking is currently disabled - table needs to be created
export function useMoods() {
  const { user } = useAuth();
  const [moods, setMoods] = useState<MoodEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [todayMood, setTodayMood] = useState<MoodEntry | null>(null);

  const logMood = async (mood: string, moodScore: number, note?: string) => {
    console.log("Mood tracking not yet available:", { mood, moodScore, note });
    return null;
  };

  const fetchMoods = async () => {
    // Mood entries table not available
  };

  return {
    moods,
    todayMood,
    isLoading,
    logMood,
    refreshMoods: fetchMoods,
  };
}
