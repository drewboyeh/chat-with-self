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

  // Room selection view - Museum Hall with Doorways
  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-100 via-stone-50 to-stone-100 relative overflow-hidden">
      {/* Museum Hall Background */}
      {/* Marble Floor Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            repeating-linear-gradient(90deg, transparent, transparent 100px, rgba(0,0,0,0.02) 100px, rgba(0,0,0,0.02) 102px),
            repeating-linear-gradient(0deg, transparent, transparent 100px, rgba(0,0,0,0.02) 100px, rgba(0,0,0,0.02) 102px)
          `,
        }} />
      </div>

      {/* Columns on sides */}
      <div className="absolute inset-y-0 left-0 w-32 pointer-events-none">
        <div className="h-full w-16 bg-gradient-to-r from-stone-200/40 via-stone-100/30 to-transparent">
          {/* Column fluting */}
          <div className="absolute inset-y-0 left-4 w-1 bg-stone-300/20" />
          <div className="absolute inset-y-0 left-8 w-1 bg-stone-300/20" />
        </div>
      </div>
      <div className="absolute inset-y-0 right-0 w-32 pointer-events-none">
        <div className="h-full w-16 ml-auto bg-gradient-to-l from-stone-200/40 via-stone-100/30 to-transparent">
          <div className="absolute inset-y-0 right-4 w-1 bg-stone-300/20" />
          <div className="absolute inset-y-0 right-8 w-1 bg-stone-300/20" />
        </div>
      </div>

      {/* Ceiling Details */}
      <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-stone-200/30 via-stone-100/20 to-transparent pointer-events-none">
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-stone-300/30" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-5xl md:text-6xl font-serif font-bold text-stone-800 mb-3 drop-shadow-lg">
            Museum Gallery
          </h1>
          <p className="text-xl text-stone-600 font-light italic">
            Choose a room to begin creating your art
          </p>
        </div>

        {/* Four Doorways - Museum Rooms */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 max-w-7xl w-full">
          {/* Daily Goals Room Doorway */}
          <MuseumDoorway
            icon={Calendar}
            title="Daily Goals"
            subtitle="Small daily habits"
            artCount={dailyArt.length}
            onClick={() => setSelectedRoom("daily")}
            color="from-blue-200/30 to-blue-100/20"
            hoverColor="from-blue-300/40 to-blue-200/30"
          />

          {/* Short-Term Goals Room Doorway */}
          <MuseumDoorway
            icon={Clock}
            title="Short-Term"
            subtitle="Week to month"
            artCount={shortTermArt.length}
            onClick={() => setSelectedRoom("short-term")}
            color="from-green-200/30 to-green-100/20"
            hoverColor="from-green-300/40 to-green-200/30"
          />

          {/* Medium-Term Goals Room Doorway */}
          <MuseumDoorway
            icon={TrendingUp}
            title="Medium-Term"
            subtitle="Month to 6 months"
            artCount={mediumTermArt.length}
            onClick={() => setSelectedRoom("medium-term")}
            color="from-amber-200/30 to-amber-100/20"
            hoverColor="from-amber-300/40 to-amber-200/30"
          />

          {/* Long-Term Goals Room Doorway */}
          <MuseumDoorway
            icon={Mountain}
            title="Long-Term"
            subtitle="6 months or longer"
            artCount={longTermArt.length}
            onClick={() => setSelectedRoom("long-term")}
            color="from-purple-200/30 to-purple-100/20"
            hoverColor="from-purple-300/40 to-purple-200/30"
          />
        </div>

        {/* Decorative Quote */}
        <div className="mt-16 text-center max-w-2xl">
          <p className="text-stone-600 text-lg italic font-serif">
            "Every goal is a doorway. Every step forward is a masterpiece in the making."
          </p>
        </div>
      </div>
    </div>
  );
}

// Museum Doorway Component
function MuseumDoorway({
  icon: Icon,
  title,
  subtitle,
  artCount,
  onClick,
  color,
  hoverColor,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
  artCount: number;
  onClick: () => void;
  color: string;
  hoverColor: string;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* Doorway Frame */}
      <div className={`
        relative w-full h-80 md:h-96 rounded-2xl overflow-hidden
        bg-gradient-to-b ${isHovered ? hoverColor : color}
        border-2 ${isHovered ? "border-stone-400 shadow-2xl" : "border-stone-300/50 shadow-xl"}
        transition-all duration-500
        ${isHovered ? "scale-105 -translate-y-2" : ""}
      `}>
        {/* Classical Archway */}
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <div className={`
            relative w-3/4 h-3/4
            border-4 ${isHovered ? "border-stone-400" : "border-stone-300/60"}
            rounded-t-full
            bg-gradient-to-b from-white/30 via-white/10 to-transparent
            transition-all duration-500
            ${isHovered ? "border-opacity-100" : ""}
          `}>
            {/* Glow effect on hover */}
            {isHovered && (
              <div className={`absolute inset-0 bg-gradient-to-b ${hoverColor} rounded-t-full animate-pulse`} />
            )}
            
            {/* Icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <Icon className={`
                w-16 h-16 text-stone-700
                transition-all duration-500
                ${isHovered ? "scale-125 text-stone-900" : ""}
              `} />
            </div>

            {/* Light rays from doorway */}
            {isHovered && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-transparent rounded-t-full" />
              </div>
            )}
          </div>
        </div>

        {/* Doorway Base/Threshold */}
        <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-t from-stone-300/40 to-transparent" />

        {/* Label Plaque */}
        <div className="absolute bottom-6 left-0 right-0 text-center px-4">
          <div className={`
            inline-block bg-stone-50/90 backdrop-blur-sm rounded-lg px-4 py-2
            border ${isHovered ? "border-stone-400" : "border-stone-300/50"}
            shadow-lg transition-all duration-500
            ${isHovered ? "scale-110" : ""}
          `}>
            <h3 className="text-lg md:text-xl font-serif font-bold text-stone-800 mb-1">
              {title}
            </h3>
            <p className="text-xs md:text-sm text-stone-600 mb-2">
              {subtitle}
            </p>
            <div className="text-xs font-medium text-primary">
              {artCount} art piece{artCount !== 1 ? "s" : ""}
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-4 left-4 right-4 flex justify-between pointer-events-none">
          <div className={`w-8 h-8 rounded-full bg-stone-200/30 ${isHovered ? "bg-stone-300/50" : ""} transition-all duration-500`} />
          <div className={`w-8 h-8 rounded-full bg-stone-200/30 ${isHovered ? "bg-stone-300/50" : ""} transition-all duration-500`} />
        </div>
      </div>
    </div>
  );
}

