import { useMoods } from "@/hooks/useMoods";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { format, subDays } from "date-fns";

interface MoodHistoryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MOOD_LABELS: Record<number, string> = {
  1: "Struggling",
  2: "Low",
  3: "Okay",
  4: "Good",
  5: "Great",
};

const MOOD_EMOJIS: Record<number, string> = {
  1: "😢",
  2: "😔",
  3: "😐",
  4: "🙂",
  5: "😊",
};

export function MoodHistory({ open, onOpenChange }: MoodHistoryProps) {
  const { moods, isLoading } = useMoods();

  // Prepare chart data - last 14 days
  const chartData = [];
  for (let i = 13; i >= 0; i--) {
    const date = subDays(new Date(), i);
    const dateStr = date.toDateString();
    const dayMood = moods.find(
      (m) => new Date(m.created_at).toDateString() === dateStr
    );

    chartData.push({
      date: format(date, "MMM d"),
      score: dayMood?.mood_score || null,
      mood: dayMood?.mood || null,
      fullDate: dateStr,
    });
  }

  // Calculate average mood
  const moodsWithScore = moods.filter((m) => m.mood_score);
  const avgMood =
    moodsWithScore.length > 0
      ? moodsWithScore.reduce((acc, m) => acc + m.mood_score, 0) /
        moodsWithScore.length
      : 0;

  // Find most common mood
  const moodCounts: Record<number, number> = {};
  moods.forEach((m) => {
    moodCounts[m.mood_score] = (moodCounts[m.mood_score] || 0) + 1;
  });
  const mostCommonScore = Object.entries(moodCounts).sort(
    (a, b) => b[1] - a[1]
  )[0]?.[0];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">
            Your Mood Journey
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : moods.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-4xl mb-4">📊</p>
            <p className="text-muted-foreground">
              Start logging your moods to see patterns over time.
            </p>
          </div>
        ) : (
          <div className="space-y-6 py-4">
            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-muted rounded-xl p-4 text-center">
                <p className="text-2xl mb-1">
                  {MOOD_EMOJIS[Math.round(avgMood)] || "—"}
                </p>
                <p className="text-xs text-muted-foreground">Average</p>
              </div>
              <div className="bg-muted rounded-xl p-4 text-center">
                <p className="text-2xl mb-1">{moods.length}</p>
                <p className="text-xs text-muted-foreground">Entries</p>
              </div>
              <div className="bg-muted rounded-xl p-4 text-center">
                <p className="text-2xl mb-1">
                  {mostCommonScore
                    ? MOOD_EMOJIS[parseInt(mostCommonScore)]
                    : "—"}
                </p>
                <p className="text-xs text-muted-foreground">Most Common</p>
              </div>
            </div>

            {/* Chart */}
            <div className="bg-muted/50 rounded-xl p-4">
              <p className="text-sm font-medium mb-4">Last 14 Days</p>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(var(--border))"
                    />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 10 }}
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <YAxis
                      domain={[1, 5]}
                      ticks={[1, 2, 3, 4, 5]}
                      tickFormatter={(v) => MOOD_EMOJIS[v] || ""}
                      width={30}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          if (!data.score) return null;
                          return (
                            <div className="bg-card border rounded-lg p-2 shadow-lg">
                              <p className="text-sm font-medium">{data.date}</p>
                              <p className="text-lg">
                                {data.mood} {MOOD_LABELS[data.score]}
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--primary))", strokeWidth: 0 }}
                      connectNulls={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recent Entries */}
            <div>
              <p className="text-sm font-medium mb-3">Recent Entries</p>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {moods.slice(0, 10).map((mood) => (
                  <div
                    key={mood.id}
                    className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg"
                  >
                    <span className="text-2xl">{mood.mood}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">
                        {MOOD_LABELS[mood.mood_score]}
                      </p>
                      {mood.note && (
                        <p className="text-xs text-muted-foreground truncate">
                          {mood.note}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(mood.created_at), "MMM d, h:mm a")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
