import { Button } from "@/components/ui/button";
import { useMoods } from "@/hooks/useMoods";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Smile, BarChart3, MessageSquareHeart, Target } from "lucide-react";

interface WellnessHubProps {
  onOpenMoodTracker: () => void;
  onOpenMoodHistory: () => void;
  onOpenPrompts: () => void;
  onOpenGoals: () => void;
}

export function WellnessHub({
  onOpenMoodTracker,
  onOpenMoodHistory,
  onOpenPrompts,
  onOpenGoals,
}: WellnessHubProps) {
  const { todayMood } = useMoods();

  const actions = [
    {
      icon: todayMood ? (
        <span className="text-2xl">{todayMood.mood}</span>
      ) : (
        <Smile className="w-6 h-6" />
      ),
      label: todayMood ? "Update Mood" : "Log Mood",
      description: todayMood
        ? "You've logged your mood today"
        : "How are you feeling?",
      onClick: onOpenMoodTracker,
      highlight: !todayMood,
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      label: "Mood History",
      description: "View your emotional patterns",
      onClick: onOpenMoodHistory,
    },
    {
      icon: <MessageSquareHeart className="w-6 h-6" />,
      label: "Daily Prompts",
      description: "Guided reflection exercises",
      onClick: onOpenPrompts,
    },
    {
      icon: <Target className="w-6 h-6" />,
      label: "Art Projects",
      description: "Create art for your gallery",
      onClick: onOpenGoals,
    },
  ];

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="relative"
        >
          <Smile className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Wellness</span>
          {!todayMood && (
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-80">
        <SheetHeader>
          <SheetTitle className="font-serif text-xl">Wellness Hub</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-3">
          {actions.map((action) => (
            <button
              key={action.label}
              onClick={() => {
                action.onClick();
              }}
              className={`w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all hover:bg-muted ${
                action.highlight
                  ? "bg-primary/10 border border-primary/20"
                  : "bg-muted/50"
              }`}
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  action.highlight
                    ? "bg-primary/20 text-primary"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {action.icon}
              </div>
              <div>
                <p className="font-medium">{action.label}</p>
                <p className="text-sm text-muted-foreground">
                  {action.description}
                </p>
              </div>
            </button>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="mt-8 p-4 bg-muted/50 rounded-xl">
          <p className="text-sm font-medium mb-3">Today's Check-in</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center">
              <p className="text-2xl">
                {todayMood ? todayMood.mood : "—"}
              </p>
              <p className="text-xs text-muted-foreground">Mood</p>
            </div>
            <div className="text-center">
              <p className="text-2xl">📝</p>
              <p className="text-xs text-muted-foreground">Journal</p>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
