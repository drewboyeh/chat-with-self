import { Sparkles } from "lucide-react";

export function EmptyState() {
  return (
    <div className="flex-1 flex items-center justify-center px-4">
      <div className="text-center max-w-md animate-fade-in">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
          <Sparkles className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-serif font-medium text-foreground mb-3">
          Begin Your Journey
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          Write your first journal entry below. As you continue, you'll be able to 
          have meaningful conversations with your past self, who will remember 
          and reflect on everything you've shared.
        </p>
        <div className="mt-8 flex flex-wrap gap-2 justify-center">
          {["How are you feeling today?", "What's on your mind?", "Describe your day"].map(
            (prompt) => (
              <span
                key={prompt}
                className="px-4 py-2 rounded-full bg-secondary text-secondary-foreground text-sm"
              >
                {prompt}
              </span>
            )
          )}
        </div>
      </div>
    </div>
  );
}
