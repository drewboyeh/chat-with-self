import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ArtRenderer } from "./ArtRenderer";
import { Sparkles, Star, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ArtCelebrationProps {
  open: boolean;
  onClose: () => void;
  type: "completion" | "progress";
  goalTitle: string;
  artData?: any;
  progress?: number;
  totalPieces?: number;
  revealedPieces?: number;
  newPiecesRevealed?: number;
}

/**
 * Celebration animation component for art piece unlocks
 * Shows full art for completed goals, or piece reveals for progress
 */
export function ArtCelebration({
  open,
  onClose,
  type,
  goalTitle,
  artData,
  progress = 0,
  totalPieces,
  revealedPieces = 0,
  newPiecesRevealed = 0,
}: ArtCelebrationProps) {
  const [animationStage, setAnimationStage] = useState<"sparkles" | "reveal" | "complete">("sparkles");
  const [showPieces, setShowPieces] = useState(0);

  useEffect(() => {
    if (!open) {
      setAnimationStage("sparkles");
      setShowPieces(0);
      return;
    }

    // Stage 1: Sparkles animation
    const sparklesTimer = setTimeout(() => {
      setAnimationStage("reveal");
    }, 1500);

    // Stage 2: Art reveal animation
    const revealTimer = setTimeout(() => {
      setAnimationStage("complete");
      if (type === "progress" && newPiecesRevealed) {
        // Animate pieces appearing one by one
        let currentPieces = 0;
        const pieceInterval = setInterval(() => {
          currentPieces++;
          setShowPieces(currentPieces);
          if (currentPieces >= newPiecesRevealed) {
            clearInterval(pieceInterval);
          }
        }, 100);
      }
    }, 2500);

    return () => {
      clearTimeout(sparklesTimer);
      clearTimeout(revealTimer);
    };
  }, [open, type, newPiecesRevealed]);

  const getTitle = () => {
    if (type === "completion") {
      return "🎨 Art Piece Complete!";
    }
    return "✨ New Pieces Revealed!";
  };

  const getDescription = () => {
    if (type === "completion") {
      return `"${goalTitle}" is now complete! Your masterpiece has been added to your gallery.`;
    }
    if (newPiecesRevealed) {
      return `${newPiecesRevealed} new piece${newPiecesRevealed > 1 ? "s" : ""} revealed! ${revealedPieces}/${totalPieces} pieces unlocked.`;
    }
    return `Progress on "${goalTitle}"! ${progress}% complete.`;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl p-0 overflow-hidden border-none bg-transparent">
        <div className="relative w-full aspect-square bg-background/95 backdrop-blur-lg rounded-2xl overflow-hidden">
          {/* Sparkles background animation */}
          {animationStage === "sparkles" && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-64 h-64">
                {[...Array(20)].map((_, i) => (
                  <Sparkles
                    key={i}
                    className="absolute animate-ping"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                      animationDelay: `${Math.random() * 2}s`,
                      animationDuration: `${1 + Math.random() * 2}s`,
                    }}
                    size={16 + Math.random() * 24}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Art reveal animation */}
          {animationStage !== "sparkles" && artData && (
            <div className="absolute inset-0 flex items-center justify-center p-8">
              <div
                className={`transition-all duration-1000 ${
                  animationStage === "reveal"
                    ? "scale-0 opacity-0"
                    : "scale-100 opacity-100"
                }`}
              >
                <ArtRenderer
                  artData={artData}
                  size="lg"
                  completionPercentage={type === "completion" ? 100 : progress}
                />
              </div>
            </div>
          )}

          {/* Piece reveal animation for progress */}
          {type === "progress" && totalPieces && animationStage === "complete" && (
            <div className="absolute bottom-20 left-0 right-0 px-8">
              <div className="bg-card/90 backdrop-blur-sm rounded-xl p-4 border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-5 h-5 text-yellow-500 animate-pulse" />
                  <span className="font-medium">Pieces Revealed</span>
                </div>
                <div className="grid grid-cols-10 gap-1 mb-2">
                  {Array.from({ length: totalPieces }).map((_, i) => {
                    const isRevealed = i < revealedPieces;
                    const isNewlyRevealed = i >= revealedPieces - newPiecesRevealed && i < revealedPieces;
                    return (
                      <div
                        key={i}
                        className={`aspect-square rounded transition-all duration-300 ${
                          isRevealed
                            ? isNewlyRevealed
                              ? "bg-primary scale-110 animate-pulse"
                              : "bg-primary/60"
                            : "bg-muted"
                        }`}
                        style={{
                          animationDelay: isNewlyRevealed ? `${(i - (revealedPieces - newPiecesRevealed)) * 0.1}s` : "0s",
                        }}
                      />
                    );
                  })}
                </div>
                <div className="text-sm text-muted-foreground text-center">
                  {revealedPieces} / {totalPieces} pieces
                </div>
              </div>
            </div>
          )}

          {/* Content overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 pointer-events-none">
            <div
              className={`text-center space-y-4 transition-all duration-1000 ${
                animationStage === "complete" ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
            >
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/20 mb-4">
                <Palette className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-3xl font-serif font-bold">{getTitle()}</h2>
              <p className="text-lg text-muted-foreground max-w-md">{getDescription()}</p>
            </div>
          </div>

          {/* Close button */}
          {animationStage === "complete" && (
            <div className="absolute bottom-4 left-0 right-0 flex justify-center pointer-events-auto">
              <Button
                onClick={onClose}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                size="lg"
              >
                View in Gallery
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

