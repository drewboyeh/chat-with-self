import { MessageSquare, Sparkles } from "lucide-react";

interface EmptyStateProps {
  onStartWriting?: () => void;
}

export function EmptyState({ onStartWriting }: EmptyStateProps) {
  return (
    <div className="flex-1 flex items-center justify-center px-4">
      <div className="text-center max-w-2xl animate-fade-in space-y-8">
        {/* Simple decorative element */}
        <div className="flex justify-center">
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-12 h-12 text-primary" />
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-serif font-medium text-foreground">
            Start Your First Entry
          </h2>
          <p className="text-muted-foreground leading-relaxed max-w-md mx-auto">
            Share what's on your mind. Every entry helps your future self become more realized.
          </p>
          <div className="mt-6 flex flex-wrap gap-2 justify-center">
            {["How are you feeling today?", "What's on your mind?", "Describe your day"].map(
              (prompt) => (
                <button
                  key={prompt}
                  onClick={onStartWriting}
                  className="px-4 py-2 rounded-full bg-secondary text-secondary-foreground text-sm hover:bg-secondary/80 transition-colors cursor-pointer"
                >
                  {prompt}
                </button>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
