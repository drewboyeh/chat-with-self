import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGoals } from "@/hooks/useGoals";
import { usePieceBasedArt } from "@/hooks/usePieceBasedArt";
import { useToast } from "@/hooks/use-toast";
import { useGoalArt } from "@/hooks/useGoalArt";
import { ArtRenderer } from "./ArtRenderer";
import {
  Calendar,
  Target,
  Plus,
  ArrowLeft,
  Palette,
  Clock,
  TrendingUp,
  Mountain,
} from "lucide-react";

type RoomType = "daily" | "short-term" | "medium-term" | "long-term" | null;

const DAILY_SUGGESTIONS = [
  "Get out of bed",
  "Drink 8 glasses of water",
  "Walk 10,000 steps",
  "Exercise for 30 minutes",
  "Meditate for 10 minutes",
  "Read for 20 minutes",
  "Eat 3 healthy meals",
  "Get 8 hours of sleep",
];

const SHORT_TERM_SUGGESTIONS = [
  "Exercise 3 times this week",
  "Complete work project by Friday",
  "Call 3 friends this week",
  "Cook 5 home meals this week",
  "Read 2 chapters of a book",
  "Practice a skill for 1 hour daily",
];

const MEDIUM_TERM_SUGGESTIONS = [
  "Lose 10 pounds in 3 months",
  "Finish reading a book",
  "Complete an online course",
  "Save $500 in 2 months",
  "Learn a new language (basics)",
  "Build a habit for 30 days",
];

const LONG_TERM_SUGGESTIONS = [
  "Lose 50 pounds in 1 year",
  "Start or change jobs",
  "Start a company",
  "Complete a degree or certification",
  "Buy a house",
  "Run a marathon",
];

export function MuseumGallery() {
  const [selectedRoom, setSelectedRoom] = useState<RoomType>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<string>("");
  const [customGoal, setCustomGoal] = useState({
    title: "",
    description: "",
    category: "personal",
    targetDate: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { createGoal } = useGoals();
  const { generateArtForGoal } = usePieceBasedArt();
  const { artPieces, isLoading: artLoading } = useGoalArt();
  const { toast } = useToast();

  const handleSuggestionClick = (suggestion: string) => {
    setSelectedSuggestion(suggestion);
    setCustomGoal({ ...customGoal, title: suggestion });
    setShowCreateDialog(true);
  };

  const handleCreateCustom = () => {
    setSelectedSuggestion("");
    setCustomGoal({ title: "", description: "", category: "personal", targetDate: "" });
    setShowCreateDialog(true);
  };

  const handleCreateGoal = async () => {
    const title = selectedSuggestion || customGoal.title;
    if (!title.trim()) return;

    setIsSubmitting(true);

    // Calculate timeframe based on room
    let timeframe = "monthly";
    let targetDate: string | undefined = customGoal.targetDate || undefined;

    if (selectedRoom === "daily") {
      timeframe = "daily";
      // Set target date to today
      targetDate = new Date().toISOString().split("T")[0];
    } else if (selectedRoom === "short-term") {
      timeframe = "weekly";
      if (!targetDate) {
        const date = new Date();
        date.setDate(date.getDate() + 7);
        targetDate = date.toISOString().split("T")[0];
      }
    } else if (selectedRoom === "medium-term") {
      timeframe = "monthly";
      if (!targetDate) {
        const date = new Date();
        date.setMonth(date.getMonth() + 3);
        targetDate = date.toISOString().split("T")[0];
      }
    } else if (selectedRoom === "long-term") {
      timeframe = "long_term";
      if (!targetDate) {
        const date = new Date();
        date.setFullYear(date.getFullYear() + 1);
        targetDate = date.toISOString().split("T")[0];
      }
    }

    const result = await createGoal(
      title,
      customGoal.category,
      customGoal.description || undefined,
      targetDate,
      timeframe
    );

    if (result) {
      // Generate art for the goal
      const startDate = new Date(result.created_at);
      const targetDateObj = result.target_date ? new Date(result.target_date) : null;
      await generateArtForGoal(result.id, result.title, startDate, targetDateObj);

      toast({
        title: "Art Project Started!",
        description: "Your new art piece will appear as you make progress.",
      });

      setShowCreateDialog(false);
      setSelectedSuggestion("");
      setCustomGoal({ title: "", description: "", category: "personal", targetDate: "" });
    } else {
      toast({
        title: "Failed to create goal",
        description: "Please try again.",
        variant: "destructive",
      });
    }

    setIsSubmitting(false);
  };

  const getRoomSuggestions = () => {
    switch (selectedRoom) {
      case "daily":
        return DAILY_SUGGESTIONS;
      case "short-term":
        return SHORT_TERM_SUGGESTIONS;
      case "medium-term":
        return MEDIUM_TERM_SUGGESTIONS;
      case "long-term":
        return LONG_TERM_SUGGESTIONS;
      default:
        return [];
    }
  };

  const getRoomTitle = () => {
    switch (selectedRoom) {
      case "daily":
        return "Daily Goals";
      case "short-term":
        return "Short-Term Goals (Week to Month)";
      case "medium-term":
        return "Medium-Term Goals (Month to 6 Months)";
      case "long-term":
        return "Long-Term Goals (6 Months or Longer)";
      default:
        return "";
    }
  };

  const getRoomIcon = () => {
    switch (selectedRoom) {
      case "daily":
        return Calendar;
      case "short-term":
        return Clock;
      case "medium-term":
        return TrendingUp;
      case "long-term":
        return Mountain;
      default:
        return Target;
    }
  };

  // Group art pieces by type
  const dailyArt = artPieces.filter((a) => a.art_type === "daily");
  const shortTermArt = artPieces.filter((a) => a.art_type === "weekly" || a.art_type === "monthly");
  const mediumTermArt = artPieces.filter((a) => a.art_type === "yearly");
  const longTermArt = artPieces.filter((a) => a.art_type === "long_term" || a.art_type === "masterpiece");

  const getArtForRoom = () => {
    switch (selectedRoom) {
      case "daily":
        return dailyArt;
      case "short-term":
        return shortTermArt;
      case "medium-term":
        return mediumTermArt;
      case "long-term":
        return longTermArt;
      default:
        return [];
    }
  };

  if (selectedRoom) {
    const RoomIcon = getRoomIcon();
    const suggestions = getRoomSuggestions();
    const roomArt = getArtForRoom();

    return (
      <div className="min-h-screen bg-gradient-to-b from-stone-50 to-stone-100 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => setSelectedRoom(null)}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Rooms
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <RoomIcon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-serif font-bold">{getRoomTitle()}</h1>
                <p className="text-muted-foreground">
                  {roomArt.length} art piece{roomArt.length !== 1 ? "s" : ""} in this room
                </p>
              </div>
            </div>
          </div>

          {/* Art Gallery Grid */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Your Art Collection</h2>
            {roomArt.length === 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {[...Array(12)].map((_, i) => (
                  <div
                    key={i}
                    className="aspect-square bg-muted/30 rounded-xl border-2 border-dashed border-muted-foreground/20 flex items-center justify-center"
                  >
                    <Palette className="w-8 h-8 text-muted-foreground/30" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {roomArt.map((piece) => (
                  <div key={piece.id} className="aspect-square">
                    <ArtRenderer
                      artData={piece.art_data}
                      size="sm"
                      completionPercentage={piece.completion_percentage}
                    />
                  </div>
                ))}
                {/* Empty slots */}
                {[...Array(Math.max(0, 12 - roomArt.length))].map((_, i) => (
                  <div
                    key={`empty-${i}`}
                    className="aspect-square bg-muted/30 rounded-xl border-2 border-dashed border-muted-foreground/20 flex items-center justify-center"
                  >
                    <Palette className="w-8 h-8 text-muted-foreground/30" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Suggestions */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Suggested Goals</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
              {suggestions.map((suggestion, i) => (
                <Button
                  key={i}
                  variant="outline"
                  className="h-auto py-3 px-4 text-left justify-start hover:bg-primary/5 hover:border-primary/50"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <Target className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="text-sm">{suggestion}</span>
                </Button>
              ))}
            </div>
            <Button
              onClick={handleCreateCustom}
              className="w-full md:w-auto"
              variant="default"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Your Own {selectedRoom === "daily" ? "Daily" : selectedRoom === "short-term" ? "Short-Term" : selectedRoom === "medium-term" ? "Medium-Term" : "Long-Term"} Goal
            </Button>
          </div>
        </div>

        {/* Create Goal Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Art Project</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Goal Title</label>
                <Input
                  value={customGoal.title}
                  onChange={(e) => setCustomGoal({ ...customGoal, title: e.target.value })}
                  placeholder="What art piece are you creating?"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Description (optional)</label>
                <Textarea
                  value={customGoal.description}
                  onChange={(e) => setCustomGoal({ ...customGoal, description: e.target.value })}
                  placeholder="What will this art piece represent?"
                  rows={3}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Category</label>
                <Select
                  value={customGoal.category}
                  onValueChange={(v) => setCustomGoal({ ...customGoal, category: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="personal">Personal</SelectItem>
                    <SelectItem value="health">Health</SelectItem>
                    <SelectItem value="career">Career</SelectItem>
                    <SelectItem value="relationships">Relationships</SelectItem>
                    <SelectItem value="growth">Growth</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {selectedRoom !== "daily" && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Target Date (optional)</label>
                  <Input
                    type="date"
                    value={customGoal.targetDate}
                    onChange={(e) => setCustomGoal({ ...customGoal, targetDate: e.target.value })}
                  />
                </div>
              )}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowCreateDialog(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateGoal}
                  disabled={!customGoal.title.trim() || isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? "Creating..." : "Start Art Project"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Room selection view
  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-stone-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-serif font-bold mb-2">Museum Gallery</h1>
          <p className="text-lg text-muted-foreground">
            Choose a room to view your art collection and create new art projects
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Daily Goals Room */}
          <div
            className="bg-card rounded-xl p-6 border-2 border-border hover:border-primary/50 cursor-pointer transition-all hover:shadow-lg"
            onClick={() => setSelectedRoom("daily")}
          >
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <Calendar className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Daily Goals</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Small daily habits that create art pieces
            </p>
            <div className="text-sm font-medium text-primary">
              {dailyArt.length} art piece{dailyArt.length !== 1 ? "s" : ""}
            </div>
          </div>

          {/* Short-Term Goals Room */}
          <div
            className="bg-card rounded-xl p-6 border-2 border-border hover:border-primary/50 cursor-pointer transition-all hover:shadow-lg"
            onClick={() => setSelectedRoom("short-term")}
          >
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <Clock className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Short-Term</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Week to month projects
            </p>
            <div className="text-sm font-medium text-primary">
              {shortTermArt.length} art piece{shortTermArt.length !== 1 ? "s" : ""}
            </div>
          </div>

          {/* Medium-Term Goals Room */}
          <div
            className="bg-card rounded-xl p-6 border-2 border-border hover:border-primary/50 cursor-pointer transition-all hover:shadow-lg"
            onClick={() => setSelectedRoom("medium-term")}
          >
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Medium-Term</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Month to 6 months
            </p>
            <div className="text-sm font-medium text-primary">
              {mediumTermArt.length} art piece{mediumTermArt.length !== 1 ? "s" : ""}
            </div>
          </div>

          {/* Long-Term Goals Room */}
          <div
            className="bg-card rounded-xl p-6 border-2 border-border hover:border-primary/50 cursor-pointer transition-all hover:shadow-lg"
            onClick={() => setSelectedRoom("long-term")}
          >
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <Mountain className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Long-Term</h3>
            <p className="text-sm text-muted-foreground mb-4">
              6 months or longer
            </p>
            <div className="text-sm font-medium text-primary">
              {longTermArt.length} art piece{longTermArt.length !== 1 ? "s" : ""}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

