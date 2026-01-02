import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { BookOpen, LogOut, Sparkles, Menu, X } from "lucide-react";
import { StreakCounter } from "./StreakCounter";
import { WellnessHub } from "./WellnessHub";

interface ChatHeaderProps {
  onToggleSidebar?: () => void;
  sidebarOpen?: boolean;
  onOpenMoodTracker?: () => void;
  onOpenMoodHistory?: () => void;
  onOpenPrompts?: () => void;
  onOpenGoals?: () => void;
}

export function ChatHeader({
  onToggleSidebar,
  sidebarOpen,
  onOpenMoodTracker,
  onOpenMoodHistory,
  onOpenPrompts,
  onOpenGoals,
}: ChatHeaderProps) {
  const { signOut } = useAuth();

  return (
    <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Sidebar Toggle Button */}
          {onToggleSidebar && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleSidebar}
              className="text-muted-foreground hover:text-foreground"
              aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          )}
          
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-serif font-medium text-foreground">
              Create Art
            </h1>
            <p className="text-xs text-muted-foreground">
              Every reflection becomes art in your gallery
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StreakCounter />
          {onOpenMoodTracker && onOpenMoodHistory && onOpenPrompts && onOpenGoals && (
            <WellnessHub
              onOpenMoodTracker={onOpenMoodTracker}
              onOpenMoodHistory={onOpenMoodHistory}
              onOpenPrompts={onOpenPrompts}
              onOpenGoals={onOpenGoals}
            />
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={signOut}
            className="text-muted-foreground hover:text-foreground"
          >
            <LogOut className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Sign out</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
