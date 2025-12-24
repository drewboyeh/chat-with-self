import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface ChatMessageProps {
  content: string;
  role: "user" | "assistant";
  createdAt: Date;
  isNew?: boolean;
}

export function ChatMessage({ content, role, createdAt, isNew = false }: ChatMessageProps) {
  const isUser = role === "user";

  return (
    <div
      className={cn(
        "flex gap-3 px-4 py-2",
        isUser ? "justify-end" : "justify-start",
        isNew && "animate-message-in"
      )}
    >
      <div
        className={cn(
          "max-w-[80%] md:max-w-[70%] rounded-2xl px-5 py-3.5 shadow-soft",
          isUser
            ? "bg-chat-user text-chat-user-foreground rounded-br-md"
            : "bg-chat-assistant text-chat-assistant-foreground rounded-bl-md"
        )}
      >
        {!isUser && (
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium text-primary opacity-80">
              Your Past Self
            </span>
          </div>
        )}
        <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{content}</p>
        <p
          className={cn(
            "text-[11px] mt-2",
            isUser ? "text-primary-foreground/60" : "text-muted-foreground"
          )}
        >
          {format(createdAt, "h:mm a")}
        </p>
      </div>
    </div>
  );
}
