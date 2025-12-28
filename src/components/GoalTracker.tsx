import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGoals, Goal } from "@/hooks/useGoals";
import { useToast } from "@/hooks/use-toast";
import {
  Plus,
  Target,
  Heart,
  Briefcase,
  Users,
  Sparkles,
  Trash2,
  CheckCircle2,
} from "lucide-react";
import { format } from "date-fns";

const CATEGORIES = [
  { id: "personal", label: "Personal", icon: Sparkles },
  { id: "health", label: "Health", icon: Heart },
  { id: "career", label: "Career", icon: Briefcase },
  { id: "relationships", label: "Relationships", icon: Users },
  { id: "growth", label: "Growth", icon: Target },
];

interface GoalTrackerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function GoalCard({
  goal,
  onUpdateProgress,
  onDelete,
}: {
  goal: Goal;
  onUpdateProgress: (id: string, progress: number) => void;
  onDelete: (id: string) => void;
}) {
  const CategoryIcon =
    CATEGORIES.find((c) => c.id === goal.category)?.icon || Target;

  return (
    <div className="bg-muted/50 rounded-xl p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <CategoryIcon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h4 className="font-medium">{goal.title}</h4>
            {goal.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {goal.description}
              </p>
            )}
            {goal.target_date && (
              <p className="text-xs text-muted-foreground mt-1">
                Target: {format(new Date(goal.target_date), "MMM d, yyyy")}
              </p>
            )}
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-destructive"
          onClick={() => onDelete(goal.id)}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-medium">{goal.progress}%</span>
        </div>
        <Progress value={goal.progress} className="h-2" />
        <div className="flex gap-2">
          {[25, 50, 75, 100].map((p) => (
            <Button
              key={p}
              variant={goal.progress >= p ? "default" : "outline"}
              size="sm"
              className="flex-1 text-xs"
              onClick={() => onUpdateProgress(goal.id, p)}
            >
              {p}%
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function GoalTracker({ open, onOpenChange }: GoalTrackerProps) {
  const [showNewGoal, setShowNewGoal] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: "",
    description: "",
    category: "personal",
    targetDate: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { activeGoals, completedGoals, createGoal, updateGoalProgress, deleteGoal } =
    useGoals();
  const { toast } = useToast();

  const handleCreateGoal = async () => {
    if (!newGoal.title.trim()) return;

    setIsSubmitting(true);
    const result = await createGoal(
      newGoal.title,
      newGoal.category,
      newGoal.description,
      newGoal.targetDate || undefined
    );

    if (result) {
      toast({
        title: "Art Project Started",
        description: "Every step forward creates art in your gallery. Keep going!",
      });
      setNewGoal({ title: "", description: "", category: "personal", targetDate: "" });
      setShowNewGoal(false);
    } else {
      toast({
        title: "Failed to create goal",
        description: "Please try again.",
        variant: "destructive",
      });
    }
    setIsSubmitting(false);
  };

  const handleUpdateProgress = async (goalId: string, progress: number) => {
    const success = await updateGoalProgress(goalId, progress);
    if (success && progress >= 100) {
      toast({
        title: "🎨 Art Piece Created!",
        description: "Amazing work! Your gallery grows with each completed goal.",
      });
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    const success = await deleteGoal(goalId);
    if (success) {
      toast({
        title: "Goal removed",
        description: "Goal has been deleted.",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
            <DialogTitle className="font-serif text-2xl flex items-center gap-2">
            <Target className="w-6 h-6 text-primary" />
            Art Projects
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="active" className="mt-2">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="active">
              Active ({activeGoals.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({completedGoals.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4 mt-4">
            {/* New Goal Form */}
            {showNewGoal ? (
              <div className="bg-muted rounded-xl p-4 space-y-3 animate-fade-in">
                <Input
                  placeholder="What art piece are you creating?"
                  value={newGoal.title}
                  onChange={(e) =>
                    setNewGoal({ ...newGoal, title: e.target.value })
                  }
                />
                <Textarea
                  placeholder="What will this art piece represent? (optional)"
                  value={newGoal.description}
                  onChange={(e) =>
                    setNewGoal({ ...newGoal, description: e.target.value })
                  }
                  className="resize-none"
                  rows={2}
                />
                <div className="flex gap-2">
                  <Select
                    value={newGoal.category}
                    onValueChange={(v) =>
                      setNewGoal({ ...newGoal, category: v })
                    }
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          <div className="flex items-center gap-2">
                            <cat.icon className="w-4 h-4" />
                            {cat.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="date"
                    value={newGoal.targetDate}
                    onChange={(e) =>
                      setNewGoal({ ...newGoal, targetDate: e.target.value })
                    }
                    className="flex-1"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowNewGoal(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateGoal}
                    disabled={!newGoal.title.trim() || isSubmitting}
                    className="flex-1"
                  >
                    {isSubmitting ? "Creating..." : "Start Art Project"}
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant="outline"
                className="w-full border-dashed"
                onClick={() => setShowNewGoal(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Start New Art Project
              </Button>
            )}

            {/* Active Goals List */}
            {activeGoals.length === 0 ? (
              <div className="text-center py-8">
                <Target className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">
                  No active goals yet. Set your first goal!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {activeGoals.map((goal) => (
                  <GoalCard
                    key={goal.id}
                    goal={goal}
                    onUpdateProgress={handleUpdateProgress}
                    onDelete={handleDeleteGoal}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4 mt-4">
            {completedGoals.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle2 className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">
                  Completed goals will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {completedGoals.map((goal) => (
                  <div
                    key={goal.id}
                    className="bg-muted/30 rounded-xl p-4 flex items-center gap-3"
                  >
                    <CheckCircle2 className="w-6 h-6 text-emerald-500 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium line-through opacity-70">
                        {goal.title}
                      </p>
                      {goal.completed_at && (
                        <p className="text-xs text-muted-foreground">
                          Completed{" "}
                          {format(new Date(goal.completed_at), "MMM d, yyyy")}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => handleDeleteGoal(goal.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
