export function TypingIndicator() {
  return (
    <div className="flex gap-3 px-4 py-2 justify-start animate-fade-in">
      <div className="bg-chat-assistant text-chat-assistant-foreground rounded-2xl rounded-bl-md px-5 py-4 shadow-soft">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-medium text-primary opacity-80">
            Your Past Self
          </span>
        </div>
        <div className="flex gap-1.5">
          <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-typing" style={{ animationDelay: "0ms" }} />
          <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-typing" style={{ animationDelay: "200ms" }} />
          <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-typing" style={{ animationDelay: "400ms" }} />
        </div>
      </div>
    </div>
  );
}
