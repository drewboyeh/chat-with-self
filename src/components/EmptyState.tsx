import { MessageSquare } from "lucide-react";

interface EmptyStateProps {
  onStartWriting?: () => void;
}

export function EmptyState({ onStartWriting }: EmptyStateProps) {
  return (
    <div className="flex-1 flex items-center justify-center px-4">
      <div className="text-center max-w-md animate-fade-in">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
          <MessageSquare className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-serif font-medium text-foreground mb-3">
          Start Your First Entry
        </h2>
        <p className="text-muted-foreground leading-relaxed mb-6">
          Share what's on your mind. I'm here to listen and remember.
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
  );
}
