import { useState } from "react";
import { Palette, Paintbrush } from "lucide-react";
import { useGoalArt } from "@/hooks/useGoalArt";
import { useStreak } from "@/hooks/useStreak";

interface MuseumEntranceProps {
  onEnterGallery: () => void;
  onEnterStudio: () => void;
}

export function MuseumEntrance({ onEnterGallery, onEnterStudio }: MuseumEntranceProps) {
  const { artPieces, isLoading: artLoading } = useGoalArt();
  const { streak } = useStreak();
  const currentStreak = streak?.current_streak || 0;
  const [hoveredDoor, setHoveredDoor] = useState<"gallery" | "studio" | null>(null);

  const totalArtPieces = artPieces.length;
  const completedPieces = artPieces.filter(p => p.completion_percentage === 100).length;
  const inProgressPieces = artPieces.filter(p => p.completion_percentage < 100).length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-200 via-blue-100 to-sky-300 relative overflow-hidden">
      {/* Cloud Background */}
      <div className="absolute inset-0">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white/40 backdrop-blur-sm"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 60 + 20}%`,
              width: `${Math.random() * 200 + 100}px`,
              height: `${Math.random() * 100 + 50}px`,
              opacity: Math.random() * 0.5 + 0.3,
              animation: `float ${Math.random() * 20 + 15}s infinite ease-in-out`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      {/* Marble Pathway */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent via-stone-100/80 to-stone-200/90">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-full max-w-4xl h-24 bg-gradient-to-b from-stone-50/90 via-stone-100/80 to-stone-150/90 rounded-t-3xl shadow-2xl border-t-2 border-stone-200/50">
            {/* Pathway texture lines */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-3/4 h-1 bg-stone-200/40 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Columns - Multiple Rows for Depth */}
      <div className="absolute inset-0 flex items-end justify-center pointer-events-none">
        {/* Back Row - Smaller, More Distant */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-8 md:gap-16">
          {/* Back Left Column */}
          <div className="relative w-12 md:w-16 h-[40vh] md:h-[50vh]">
            <div className="absolute inset-0 bg-gradient-to-b from-stone-50 via-stone-100 to-stone-150 rounded-t-2xl shadow-lg border-2 border-stone-200/50">
              {/* Fluted column details */}
              <div className="absolute inset-x-2 top-2 bottom-2 bg-gradient-to-r from-stone-200/30 via-transparent to-stone-200/30 rounded" />
              <div className="absolute inset-x-4 top-2 bottom-2 bg-gradient-to-r from-stone-200/30 via-transparent to-stone-200/30 rounded" />
            </div>
            {/* Capital */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-16 md:w-20 h-8 bg-stone-100 rounded-t-xl border-2 border-stone-200/50 shadow-md" />
          </div>

          {/* Back Right Column */}
          <div className="relative w-12 md:w-16 h-[40vh] md:h-[50vh]">
            <div className="absolute inset-0 bg-gradient-to-b from-stone-50 via-stone-100 to-stone-150 rounded-t-2xl shadow-lg border-2 border-stone-200/50">
              <div className="absolute inset-x-2 top-2 bottom-2 bg-gradient-to-r from-stone-200/30 via-transparent to-stone-200/30 rounded" />
              <div className="absolute inset-x-4 top-2 bottom-2 bg-gradient-to-r from-stone-200/30 via-transparent to-stone-200/30 rounded" />
            </div>
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-16 md:w-20 h-8 bg-stone-100 rounded-t-xl border-2 border-stone-200/50 shadow-md" />
          </div>
        </div>

        {/* Middle Row - Main Colonnade */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-4 md:gap-8">
          {/* Middle Left Column */}
          <div className="relative w-14 md:w-20 h-[50vh] md:h-[65vh]">
            <div className="absolute inset-0 bg-gradient-to-b from-stone-50 via-stone-100 to-stone-150 rounded-t-2xl shadow-xl border-2 border-stone-200/60">
              <div className="absolute inset-x-2 top-2 bottom-2 bg-gradient-to-r from-stone-200/40 via-transparent to-stone-200/40 rounded" />
              <div className="absolute inset-x-4 top-2 bottom-2 bg-gradient-to-r from-stone-200/40 via-transparent to-stone-200/40 rounded" />
              <div className="absolute inset-x-6 top-2 bottom-2 bg-gradient-to-r from-stone-200/40 via-transparent to-stone-200/40 rounded" />
            </div>
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-20 md:w-24 h-10 bg-stone-100 rounded-t-xl border-2 border-stone-200/60 shadow-lg" />
          </div>

          {/* Middle Right Column */}
          <div className="relative w-14 md:w-20 h-[50vh] md:h-[65vh]">
            <div className="absolute inset-0 bg-gradient-to-b from-stone-50 via-stone-100 to-stone-150 rounded-t-2xl shadow-xl border-2 border-stone-200/60">
              <div className="absolute inset-x-2 top-2 bottom-2 bg-gradient-to-r from-stone-200/40 via-transparent to-stone-200/40 rounded" />
              <div className="absolute inset-x-4 top-2 bottom-2 bg-gradient-to-r from-stone-200/40 via-transparent to-stone-200/40 rounded" />
              <div className="absolute inset-x-6 top-2 bottom-2 bg-gradient-to-r from-stone-200/40 via-transparent to-stone-200/40 rounded" />
            </div>
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-20 md:w-24 h-10 bg-stone-100 rounded-t-xl border-2 border-stone-200/60 shadow-lg" />
          </div>
        </div>

        {/* Front Row - Foreground Columns */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-12 md:gap-24">
          {/* Front Left Column */}
          <div className="relative w-16 md:w-24 h-[60vh] md:h-[75vh]">
            <div className="absolute inset-0 bg-gradient-to-b from-stone-50 via-stone-100 to-stone-150 rounded-t-2xl shadow-2xl border-2 border-stone-200/70">
              <div className="absolute inset-x-3 top-2 bottom-2 bg-gradient-to-r from-stone-200/50 via-transparent to-stone-200/50 rounded" />
              <div className="absolute inset-x-6 top-2 bottom-2 bg-gradient-to-r from-stone-200/50 via-transparent to-stone-200/50 rounded" />
              <div className="absolute inset-x-9 top-2 bottom-2 bg-gradient-to-r from-stone-200/50 via-transparent to-stone-200/50 rounded" />
            </div>
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-24 md:w-32 h-12 bg-stone-100 rounded-t-xl border-2 border-stone-200/70 shadow-xl" />
          </div>

          {/* Front Right Column */}
          <div className="relative w-16 md:w-24 h-[60vh] md:h-[75vh]">
            <div className="absolute inset-0 bg-gradient-to-b from-stone-50 via-stone-100 to-stone-150 rounded-t-2xl shadow-2xl border-2 border-stone-200/70">
              <div className="absolute inset-x-3 top-2 bottom-2 bg-gradient-to-r from-stone-200/50 via-transparent to-stone-200/50 rounded" />
              <div className="absolute inset-x-6 top-2 bottom-2 bg-gradient-to-r from-stone-200/50 via-transparent to-stone-200/50 rounded" />
              <div className="absolute inset-x-9 top-2 bottom-2 bg-gradient-to-r from-stone-200/50 via-transparent to-stone-200/50 rounded" />
            </div>
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-24 md:w-32 h-12 bg-stone-100 rounded-t-xl border-2 border-stone-200/70 shadow-xl" />
          </div>
        </div>
      </div>

      {/* Entablature - Horizontal Structure Above Columns */}
      <div className="absolute bottom-[60vh] md:bottom-[75vh] left-1/2 -translate-x-1/2 w-full max-w-6xl pointer-events-none">
        <div className="relative h-8 md:h-12 bg-gradient-to-b from-stone-100 via-stone-150 to-stone-100 border-2 border-stone-200/70 shadow-lg">
          {/* Frieze details */}
          <div className="absolute inset-x-4 top-1 bottom-1 bg-gradient-to-r from-stone-200/30 via-transparent to-stone-200/30 rounded" />
        </div>
      </div>

      {/* Central Archway with Pediment */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-none">
        {/* Pediment (Triangular Top) */}
        <div className="absolute -top-16 md:-top-24 left-1/2 -translate-x-1/2 w-64 md:w-96">
          <svg viewBox="0 0 200 100" className="w-full h-full">
            <polygon
              points="0,100 100,0 200,100"
              fill="url(#pedimentGradient)"
              stroke="rgb(231, 229, 228)"
              strokeWidth="2"
              className="drop-shadow-xl"
            />
            <defs>
              <linearGradient id="pedimentGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgb(250, 250, 249)" stopOpacity="0.95" />
                <stop offset="100%" stopColor="rgb(231, 229, 228)" stopOpacity="0.9" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Central Archway */}
        <div className="relative w-56 md:w-80 h-[50vh] md:h-[65vh]">
          {/* Arch Structure */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-48 md:w-72 h-[45vh] md:h-[60vh]">
              {/* Arch Opening */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-40 md:w-64 h-[40vh] md:h-[55vh]">
                  {/* Glowing White Light from Archway */}
                  <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/70 to-white/50 rounded-t-full blur-sm animate-pulse" />
                  <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-white/40 to-transparent rounded-t-full" />
                  
                  {/* Arch Border */}
                  <div className="absolute inset-0 border-4 border-stone-200/80 rounded-t-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Doorways */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-12">
        {/* Title */}
        <div className="text-center mb-8 md:mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-stone-800 mb-2 drop-shadow-lg">
            Your Gallery
          </h1>
          <p className="text-lg md:text-xl text-stone-600 font-light">
            You are a work of art
          </p>
        </div>

        {/* Stats */}
        {!artLoading && (
          <div className="flex gap-4 md:gap-6 mb-8 md:mb-12 text-center">
            <div className="bg-white/80 backdrop-blur-md rounded-xl px-4 md:px-6 py-3 md:py-4 border border-stone-200/50 shadow-lg">
              <div className="text-2xl md:text-3xl font-bold text-stone-700">{totalArtPieces}</div>
              <div className="text-xs md:text-sm text-stone-600">Art Pieces</div>
            </div>
            <div className="bg-white/80 backdrop-blur-md rounded-xl px-4 md:px-6 py-3 md:py-4 border border-stone-200/50 shadow-lg">
              <div className="text-2xl md:text-3xl font-bold text-stone-700">{currentStreak}</div>
              <div className="text-xs md:text-sm text-stone-600">Day Streak</div>
            </div>
          </div>
        )}

        {/* Two Doorways - Styled as Classical Archways */}
        <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center justify-center max-w-5xl w-full mt-8">
          {/* Gallery Doorway */}
          <div
            className="relative group cursor-pointer"
            onMouseEnter={() => setHoveredDoor("gallery")}
            onMouseLeave={() => setHoveredDoor(null)}
            onClick={onEnterGallery}
          >
            <div className={`
              relative w-56 md:w-72 h-80 md:h-96 rounded-2xl overflow-hidden
              bg-gradient-to-b from-stone-50/90 via-stone-100/80 to-stone-150/90
              border-2 ${hoveredDoor === "gallery" ? "border-stone-400 shadow-2xl" : "border-stone-300/50 shadow-xl"}
              transition-all duration-300
              ${hoveredDoor === "gallery" ? "scale-105" : ""}
            `}>
              {/* Classical Archway */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className={`
                  relative w-40 md:w-56 h-64 md:h-80
                  border-4 ${hoveredDoor === "gallery" ? "border-stone-400" : "border-stone-300/60"}
                  rounded-t-full
                  bg-gradient-to-b from-white/40 via-white/20 to-transparent
                  transition-all duration-300
                `}>
                  {/* Glow effect */}
                  {hoveredDoor === "gallery" && (
                    <div className="absolute inset-0 bg-gradient-to-b from-amber-200/30 via-amber-100/20 to-transparent rounded-t-full animate-pulse" />
                  )}
                  
                  {/* Icon */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Palette className={`
                      w-12 md:w-16 h-12 md:h-16 text-stone-600
                      transition-all duration-300
                      ${hoveredDoor === "gallery" ? "scale-125 text-amber-600" : ""}
                    `} />
                  </div>
                </div>
              </div>

              {/* Label */}
              <div className="absolute bottom-6 left-0 right-0 text-center">
                <h3 className="text-xl md:text-2xl font-serif font-bold text-stone-700 mb-1">
                  Enter Gallery
                </h3>
                <p className="text-xs md:text-sm text-stone-600">
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
              relative w-56 md:w-72 h-80 md:h-96 rounded-2xl overflow-hidden
              bg-gradient-to-b from-stone-50/90 via-stone-100/80 to-stone-150/90
              border-2 ${hoveredDoor === "studio" ? "border-stone-400 shadow-2xl" : "border-stone-300/50 shadow-xl"}
              transition-all duration-300
              ${hoveredDoor === "studio" ? "scale-105" : ""}
            `}>
              {/* Classical Archway */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className={`
                  relative w-40 md:w-56 h-64 md:h-80
                  border-4 ${hoveredDoor === "studio" ? "border-stone-400" : "border-stone-300/60"}
                  rounded-t-full
                  bg-gradient-to-b from-white/40 via-white/20 to-transparent
                  transition-all duration-300
                `}>
                  {/* Glow effect */}
                  {hoveredDoor === "studio" && (
                    <div className="absolute inset-0 bg-gradient-to-b from-purple-200/30 via-purple-100/20 to-transparent rounded-t-full animate-pulse" />
                  )}
                  
                  {/* Icon */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Paintbrush className={`
                      w-12 md:w-16 h-12 md:h-16 text-stone-600
                      transition-all duration-300
                      ${hoveredDoor === "studio" ? "scale-125 text-purple-600" : ""}
                    `} />
                  </div>
                </div>
              </div>

              {/* Label */}
              <div className="absolute bottom-6 left-0 right-0 text-center">
                <h3 className="text-xl md:text-2xl font-serif font-bold text-stone-700 mb-1">
                  Create Art
                </h3>
                <p className="text-xs md:text-sm text-stone-600">
                  Create new art projects
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Entrance Message */}
        <div className="mt-8 md:mt-12 text-center max-w-2xl">
          <p className="text-stone-600 text-base md:text-lg italic">
            "Every step forward is a brushstroke. Every goal completed is a masterpiece. Welcome to your gallery."
          </p>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
          }
          33% {
            transform: translateY(-20px) translateX(10px);
          }
          66% {
            transform: translateY(-10px) translateX(-10px);
          }
        }
      `}</style>
    </div>
  );
}
