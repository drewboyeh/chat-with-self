import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { BookOpen, LogOut, Sparkles, Menu, X, Palette } from "lucide-react";
import { StreakCounter } from "./StreakCounter";
import { WellnessHub } from "./WellnessHub";
import { LevelDisplay } from "./LevelDisplay";
import { ArtGallery } from "./ArtGallery";
import { useRewards } from "@/hooks/useRewards";

interface ChatHeaderProps {
  onOpenFutureVisions?: () => void;
  onToggleSidebar?: () => void;
  sidebarOpen?: boolean;
  onOpenMoodTracker?: () => void;
  onOpenMoodHistory?: () => void;
  onOpenPrompts?: () => void;
  onOpenGoals?: () => void;
}

export function ChatHeader({
  onOpenFutureVisions,
  onToggleSidebar,
  sidebarOpen,
  onOpenMoodTracker,
  onOpenMoodHistory,
  onOpenPrompts,
  onOpenGoals,
}: ChatHeaderProps) {
  const { signOut } = useAuth();
  const { rewards } = useRewards();
  const [artGalleryOpen, setArtGalleryOpen] = useState(false);

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
              Chat Journal
            </h1>
            <p className="text-xs text-muted-foreground">
              Reflecting with your past self
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {rewards && (
            <div className="hidden md:block">
              <LevelDisplay totalPoints={rewards.total_points} size="sm" showProgress={false} />
            </div>
          )}
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
            variant="outline"
            size="sm"
            onClick={() => setArtGalleryOpen(true)}
            className="text-primary border-primary/30 hover:bg-primary/10 hidden sm:flex"
          >
            <Palette className="w-4 h-4 mr-2" />
            Art Gallery
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setArtGalleryOpen(true)}
            className="text-primary sm:hidden"
            title="Art Gallery"
          >
            <Palette className="w-5 h-5" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenFutureVisions}
            className="text-primary border-primary/30 hover:bg-primary/10 hidden sm:flex"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Future Visions
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onOpenFutureVisions}
            className="text-primary sm:hidden"
          >
            <Sparkles className="w-5 h-5" />
          </Button>
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
      <ArtGallery open={artGalleryOpen} onOpenChange={setArtGalleryOpen} />
    </header>
  );
}
