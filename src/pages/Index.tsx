import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useReminders } from "@/hooks/useReminders";
import { NameForm } from "@/components/NameForm";
import { GoalDiscovery } from "@/components/GoalDiscovery";
import { ChatJournal } from "@/components/ChatJournal";
import { CheckInDialog } from "@/components/CheckInDialog";
import { ArtGallery } from "@/components/ArtGallery";
import { MuseumEntrance } from "@/components/MuseumEntrance";
import { SplashScreen } from "@/components/SplashScreen";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGoalArt, type GoalArtPiece } from "@/hooks/useGoalArt";
import { ArtRenderer } from "@/components/ArtRenderer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Share2, Download, Star, BookOpen, Palette, Home } from "lucide-react";

const Index = () => {
  const { user, loading } = useAuth();
  const { checkInReminder, setCheckInReminder } = useReminders();
  const [activeTab, setActiveTab] = useState("home");
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [showSplash, setShowSplash] = useState(false);
  const [showGoalDiscovery, setShowGoalDiscovery] = useState(false);

  // Check if splash screen has been shown before
  useEffect(() => {
    if (!loading && !user) {
      const hasSeenSplash = localStorage.getItem("selfart_has_seen_splash");
      if (!hasSeenSplash) {
        setShowSplash(true);
      }
    }
  }, [loading, user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center animate-fade-in">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show splash screen on first launch
  if (showSplash) {
    return (
      <SplashScreen
        onGetStarted={() => {
          localStorage.setItem("selfart_has_seen_splash", "true");
          setShowSplash(false);
        }}
      />
    );
  }

  if (!user) {
    return <NameForm onComplete={() => setShowGoalDiscovery(true)} />;
  }

  if (showGoalDiscovery) {
    return (
      <GoalDiscovery
        onComplete={() => setShowGoalDiscovery(false)}
        onSkip={() => setShowGoalDiscovery(false)}
      />
    );
  }

  return (
    <>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="min-h-screen flex flex-col">
        {/* Tab Navigation */}
        <div className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-20">
          <div className="max-w-7xl mx-auto px-4">
            <TabsList className="w-full justify-start bg-transparent h-auto p-0">
              <TabsTrigger 
                value="home" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-4"
              >
                <Home className="w-4 h-4 mr-2" />
                Entrance
              </TabsTrigger>
              <TabsTrigger 
                value="gallery" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-4"
              >
                <Palette className="w-4 h-4 mr-2" />
                Gallery
              </TabsTrigger>
              <TabsTrigger 
                value="journal" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-4"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Create Art
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        {/* Tab Content */}
        <TabsContent value="home" className="flex-1 m-0">
          <MuseumEntrance 
            onEnterGallery={() => setActiveTab("gallery")}
            onEnterStudio={() => setActiveTab("journal")}
          />
        </TabsContent>

        <TabsContent value="gallery" className="flex-1 m-0">
          <GalleryView onSwitchToJournal={() => setActiveTab("journal")} />
        </TabsContent>

        <TabsContent value="journal" className="flex-1 m-0">
          <ChatJournal />
        </TabsContent>
      </Tabs>

      {checkInReminder && (
        <CheckInDialog
          open={!!checkInReminder}
          onOpenChange={(open) => {
            if (!open) setCheckInReminder(null);
          }}
          reminder={checkInReminder}
        />
      )}

      <ArtGallery open={galleryOpen} onOpenChange={setGalleryOpen} />
    </>
  );
};

function GalleryView({ onSwitchToJournal }: { onSwitchToJournal?: () => void }) {
  const { artPieces, isLoading } = useGoalArt();
  const [selectedArt, setSelectedArt] = useState<GoalArtPiece | null>(null);

  const groupedArt = {
    all: artPieces,
    daily: artPieces.filter((a) => a.art_type === "daily"),
    weekly: artPieces.filter((a) => a.art_type === "weekly"),
    monthly: artPieces.filter((a) => a.art_type === "monthly"),
    long_term: artPieces.filter((a) => a.art_type === "long_term" || a.art_type === "masterpiece"),
  };

  const getFameColor = (fame: string) => {
    switch (fame) {
      case "common": return "bg-gray-500";
      case "uncommon": return "bg-green-500";
      case "rare": return "bg-blue-500";
      case "epic": return "bg-purple-500";
      case "legendary": return "bg-yellow-500";
      default: return "bg-gray-500";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your art collection...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-serif font-bold mb-2">Your Gallery</h1>
          <p className="text-lg text-muted-foreground">
            You are a work of art. Every goal you complete, every reflection you make, creates a new piece in your collection.
          </p>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="all">All ({groupedArt.all.length})</TabsTrigger>
            <TabsTrigger value="daily">Daily ({groupedArt.daily.length})</TabsTrigger>
            <TabsTrigger value="weekly">Weekly ({groupedArt.weekly.length})</TabsTrigger>
            <TabsTrigger value="monthly">Monthly ({groupedArt.monthly.length})</TabsTrigger>
            <TabsTrigger value="long_term">Masterpieces ({groupedArt.long_term.length})</TabsTrigger>
          </TabsList>

          {Object.entries(groupedArt).map(([type, pieces]: [string, any[]]) => (
            <TabsContent key={type} value={type}>
              {pieces.length === 0 ? (
                <div className="text-center py-12">
                  <Palette className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground text-lg font-medium">Your gallery is empty.</p>
                  <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto mb-6">
                    Start creating art by setting art projects (goals) and reflecting on your journey. Each piece represents your growth—you are the art being created.
                  </p>
                  {onSwitchToJournal && (
                    <Button onClick={onSwitchToJournal} size="lg">
                      Start Creating Your First Art Piece
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {pieces.map((piece) => (
                    <div
                      key={piece.id}
                      onClick={() => setSelectedArt(piece)}
                      className="bg-card border border-border rounded-xl p-4 space-y-3 cursor-pointer hover:border-primary/50 transition-colors"
                    >
                      <div className="aspect-square rounded-lg overflow-hidden bg-gradient-to-br from-background to-muted">
                        <ArtRenderer
                          artData={piece.art_data}
                          size="sm"
                          completionPercentage={piece.completion_percentage}
                        />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-medium text-sm line-clamp-1">{piece.title}</h4>
                        <div className="flex items-center gap-2">
                          <Badge className={`${getFameColor(piece.fame_level)} text-xs px-2 py-0`}>
                            {piece.fame_level}
                          </Badge>
                          {piece.completion_percentage < 100 && (
                            <span className="text-xs text-muted-foreground">
                              {piece.completion_percentage}%
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {/* Art Detail Modal */}
      {selectedArt && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedArt(null)}
        >
          <div 
            className="bg-card rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-5 h-5 text-yellow-500" />
              <h2 className="text-2xl font-bold">{selectedArt.title}</h2>
            </div>

            <div className="space-y-4">
              <div className="flex justify-center">
                <ArtRenderer
                  artData={selectedArt.art_data}
                  size="lg"
                  completionPercentage={selectedArt.completion_percentage}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge className={getFameColor(selectedArt.fame_level)}>
                    {selectedArt.fame_level}
                  </Badge>
                  <Badge variant="outline">{selectedArt.size}</Badge>
                  {selectedArt.goal_title && (
                    <Badge variant="secondary">From: {selectedArt.goal_title}</Badge>
                  )}
                </div>

                {selectedArt.description && (
                  <p className="text-sm text-muted-foreground">{selectedArt.description}</p>
                )}

                {selectedArt.completion_percentage < 100 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Completion</span>
                      <span>{selectedArt.completion_percentage}%</span>
                    </div>
                    <Progress value={selectedArt.completion_percentage} />
                    <p className="text-xs text-muted-foreground">
                      This art piece is still growing. Keep working toward your goal!
                    </p>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" className="flex-1">
                    <Download className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Index;