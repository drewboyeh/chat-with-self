import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Palette, Sparkles, ArrowRight, DoorOpen, Paintbrush } from "lucide-react";
import { useGoalArt } from "@/hooks/useGoalArt";
import { useStreak } from "@/hooks/useStreak";
import { useRewards } from "@/hooks/useRewards";

interface MuseumEntranceProps {
  onEnterGallery: () => void;
  onEnterStudio: () => void;
}

export function MuseumEntrance({ onEnterGallery, onEnterStudio }: MuseumEntranceProps) {
  const { artPieces, isLoading: artLoading } = useGoalArt();
  const { currentStreak } = useStreak();
  const { rewards } = useRewards();
  const [hoveredDoor, setHoveredDoor] = useState<"gallery" | "studio" | null>(null);

  const totalArtPieces = artPieces.length;
  const completedPieces = artPieces.filter(p => p.completion_percentage === 100).length;
  const inProgressPieces = artPieces.filter(p => p.completion_percentage < 100).length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated background stars */}
      <div className="absolute inset-0">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 2 + 1}px`,
              height: `${Math.random() * 2 + 1}px`,
              opacity: Math.random() * 0.8 + 0.2,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${Math.random() * 2 + 2}s`,
            }}
          />
        ))}
      </div>

      {/* Pillars */}
      <div className="absolute inset-0 flex items-end justify-center gap-8 pointer-events-none">
        {/* Left Pillar */}
        <div className="relative w-16 md:w-24 h-[60vh] md:h-[70vh]">
          <div className="absolute inset-0 bg-gradient-to-b from-amber-200/20 via-amber-100/30 to-amber-200/20 backdrop-blur-sm rounded-t-2xl border border-amber-300/30 shadow-2xl">
            {/* Pillar details */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-amber-400/40 rounded-full" />
            <div className="absolute top-16 left-1/2 -translate-x-1/2 w-12 h-1 bg-amber-300/30 rounded" />
            <div className="absolute top-32 left-1/2 -translate-x-1/2 w-8 h-8 bg-amber-400/40 rounded-full" />
            <div className="absolute top-48 left-1/2 -translate-x-1/2 w-12 h-1 bg-amber-300/30 rounded" />
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-8 h-8 bg-amber-400/40 rounded-full" />
          </div>
        </div>

        {/* Right Pillar */}
        <div className="relative w-16 md:w-24 h-[60vh] md:h-[70vh]">
          <div className="absolute inset-0 bg-gradient-to-b from-amber-200/20 via-amber-100/30 to-amber-200/20 backdrop-blur-sm rounded-t-2xl border border-amber-300/30 shadow-2xl">
            {/* Pillar details */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-amber-400/40 rounded-full" />
            <div className="absolute top-16 left-1/2 -translate-x-1/2 w-12 h-1 bg-amber-300/30 rounded" />
            <div className="absolute top-32 left-1/2 -translate-x-1/2 w-8 h-8 bg-amber-400/40 rounded-full" />
            <div className="absolute top-48 left-1/2 -translate-x-1/2 w-12 h-1 bg-amber-300/30 rounded" />
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-8 h-8 bg-amber-400/40 rounded-full" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-12">
        {/* Title */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-200 to-amber-200 mb-4 drop-shadow-2xl">
            Your Gallery
          </h1>
          <p className="text-xl md:text-2xl text-amber-100/90 font-light">
            You are a work of art
          </p>
        </div>

        {/* Stats */}
        {!artLoading && (
          <div className="flex gap-6 mb-12 text-center">
            <div className="bg-white/10 backdrop-blur-md rounded-xl px-6 py-4 border border-white/20">
              <div className="text-3xl font-bold text-amber-200">{totalArtPieces}</div>
              <div className="text-sm text-amber-100/70">Art Pieces</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl px-6 py-4 border border-white/20">
              <div className="text-3xl font-bold text-amber-200">{currentStreak}</div>
              <div className="text-sm text-amber-100/70">Day Streak</div>
            </div>
            {rewards && (
              <div className="bg-white/10 backdrop-blur-md rounded-xl px-6 py-4 border border-white/20">
                <div className="text-3xl font-bold text-amber-200">{rewards.level}</div>
                <div className="text-sm text-amber-100/70">Level</div>
              </div>
            )}
          </div>
        )}

        {/* Doorways */}
        <div className="flex flex-col md:flex-row gap-8 items-center justify-center max-w-4xl w-full">
          {/* Gallery Doorway */}
          <div
            className="relative group cursor-pointer"
            onMouseEnter={() => setHoveredDoor("gallery")}
            onMouseLeave={() => setHoveredDoor(null)}
            onClick={onEnterGallery}
          >
            <div className={`
              relative w-64 md:w-80 h-96 rounded-2xl overflow-hidden
              bg-gradient-to-b from-amber-900/40 via-purple-900/40 to-slate-900/60
              border-2 ${hoveredDoor === "gallery" ? "border-amber-400" : "border-amber-300/30"}
              transition-all duration-300
              ${hoveredDoor === "gallery" ? "scale-105 shadow-2xl shadow-amber-500/50" : "shadow-xl"}
            `}>
              {/* Doorway arch */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className={`
                  w-48 h-64 rounded-t-full border-4 ${hoveredDoor === "gallery" ? "border-amber-400" : "border-amber-300/40"}
                  bg-gradient-to-b from-amber-200/10 to-transparent
                  transition-all duration-300
                `}>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Palette className={`
                      w-16 h-16 text-amber-200
                      transition-all duration-300
                      ${hoveredDoor === "gallery" ? "scale-125 animate-pulse" : ""}
                    `} />
                  </div>
                </div>
              </div>

              {/* Doorway glow */}
              {hoveredDoor === "gallery" && (
                <div className="absolute inset-0 bg-gradient-to-b from-amber-400/20 to-transparent animate-pulse" />
              )}

              {/* Label */}
              <div className="absolute bottom-8 left-0 right-0 text-center">
                <h3 className="text-2xl font-serif font-bold text-amber-200 mb-2">
                  Enter Gallery
                </h3>
                <p className="text-sm text-amber-100/70">
                  View your collection
                </p>
              </div>
            </div>
          </div>

          {/* Studio Doorway */}
          <div
            className="relative group cursor-pointer"
            onMouseEnter={() => setHoveredDoor("studio")}
            onMouseLeave={() => setHoveredDoor(null)}
            onClick={onEnterStudio}
          >
            <div className={`
              relative w-64 md:w-80 h-96 rounded-2xl overflow-hidden
              bg-gradient-to-b from-purple-900/40 via-amber-900/40 to-slate-900/60
              border-2 ${hoveredDoor === "studio" ? "border-purple-400" : "border-purple-300/30"}
              transition-all duration-300
              ${hoveredDoor === "studio" ? "scale-105 shadow-2xl shadow-purple-500/50" : "shadow-xl"}
            `}>
              {/* Doorway arch */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className={`
                  w-48 h-64 rounded-t-full border-4 ${hoveredDoor === "studio" ? "border-purple-400" : "border-purple-300/40"}
                  bg-gradient-to-b from-purple-200/10 to-transparent
                  transition-all duration-300
                `}>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Paintbrush className={`
                      w-16 h-16 text-purple-200
                      transition-all duration-300
                      ${hoveredDoor === "studio" ? "scale-125 animate-pulse" : ""}
                    `} />
                  </div>
                </div>
              </div>

              {/* Doorway glow */}
              {hoveredDoor === "studio" && (
                <div className="absolute inset-0 bg-gradient-to-b from-purple-400/20 to-transparent animate-pulse" />
              )}

              {/* Label */}
              <div className="absolute bottom-8 left-0 right-0 text-center">
                <h3 className="text-2xl font-serif font-bold text-purple-200 mb-2">
                  Create Art
                </h3>
                <p className="text-sm text-purple-100/70">
                  Journal, set goals, reflect
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Entrance Message */}
        <div className="mt-12 text-center max-w-2xl">
          <p className="text-amber-100/80 text-lg italic">
            "Every step forward is a brushstroke. Every goal completed is a masterpiece. Welcome to your gallery."
          </p>
        </div>
      </div>
    </div>
  );
}

