import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useGoalArt, type GoalArtPiece } from "@/hooks/useGoalArt";
import { ArtRenderer } from "./ArtRenderer";
import { Share2, Download, Star, Sparkles } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ArtGalleryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ArtGallery({ open, onOpenChange }: ArtGalleryProps) {
  const { artPieces, isLoading } = useGoalArt();
  const [selectedArt, setSelectedArt] = useState<GoalArtPiece | null>(null);

  const groupedArt = {
    daily: artPieces.filter((a) => a.art_type === "daily"),
    weekly: artPieces.filter((a) => a.art_type === "weekly"),
    monthly: artPieces.filter((a) => a.art_type === "monthly"),
    yearly: artPieces.filter((a) => a.art_type === "yearly"),
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
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <div className="text-center py-8">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading your art collection...</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Your Art Collection
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">All ({artPieces.length})</TabsTrigger>
              <TabsTrigger value="daily">Daily ({groupedArt.daily.length})</TabsTrigger>
              <TabsTrigger value="weekly">Weekly ({groupedArt.weekly.length})</TabsTrigger>
              <TabsTrigger value="monthly">Monthly ({groupedArt.monthly.length})</TabsTrigger>
              <TabsTrigger value="long_term">Masterpieces ({groupedArt.long_term.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-4">
              <ScrollArea className="h-[60vh]">
                {artPieces.length === 0 ? (
                  <div className="text-center py-12">
                    <Star className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">No art pieces yet.</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Complete goals to unlock beautiful art pieces!
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {artPieces.map((piece) => (
                      <ArtCard
                        key={piece.id}
                        piece={piece}
                        onClick={() => setSelectedArt(piece)}
                        getFameColor={getFameColor}
                      />
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            {Object.entries(groupedArt).map(([type, pieces]) => (
              <TabsContent key={type} value={type} className="mt-4">
                <ScrollArea className="h-[60vh]">
                  {pieces.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">No {type} art pieces yet.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {pieces.map((piece) => (
                        <ArtCard
                          key={piece.id}
                          piece={piece}
                          onClick={() => setSelectedArt(piece)}
                          getFameColor={getFameColor}
                        />
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>
            ))}
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Art Detail View */}
      {selectedArt && (
        <Dialog open={!!selectedArt} onOpenChange={() => setSelectedArt(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                {selectedArt.title}
              </DialogTitle>
            </DialogHeader>

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
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

function ArtCard({
  piece,
  onClick,
  getFameColor,
}: {
  piece: GoalArtPiece;
  onClick: () => void;
  getFameColor: (fame: string) => string;
}) {
  return (
    <div
      onClick={onClick}
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
  );
}

