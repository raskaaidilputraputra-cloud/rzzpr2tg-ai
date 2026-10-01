import { MarkdownMessage } from "@/components/chat/MarkdownMessage";
import { cn } from "@/lib/utils";
import { Brain, RotateCcw, User } from "lucide-react";

export interface ChatMessageView {
  id: string;
  role: "user" | "assistant";
  content: string;
  isError?: boolean;
}

interface MessageBubbleProps {
  message: ChatMessageView;
  onRetry?: () => void;
}

export function MessageBubble({ message, onRetry }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const isError = Boolean(message.isError) && !isUser;

  return (
    <div
      data-ocid={`chat.message.${message.role}`}
      className={cn(
        "flex w-full items-start gap-3",
        isUser ? "justify-end" : "justify-start",
      )}
    >
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold",
          isUser
            ? "order-2 ml-3 bg-skybrand-600 text-primary-foreground"
            : "order-1 bg-gradient-primary text-primary-foreground",
        )}
        aria-hidden="true"
      >
        {isUser ? <User className="h-4 w-4" /> : <Brain className="h-4 w-4" />}
      </div>

      <div
        className={cn(
          "max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed sm:max-w-[75%]",
          isUser
            ? "order-1 rounded-tr-none bg-skybrand-600 text-primary-foreground"
            : isError
              ? "order-2 rounded-tl-none border border-destructive/40 bg-destructive/10 text-destructive shadow-subtle"
              : "order-2 rounded-tl-none border border-border bg-card text-card-foreground shadow-subtle",
        )}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        ) : (
          <>
            <MarkdownMessage
              content={message.content}
              className="break-words [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
            />
            {isError && onRetry && (
              <button
                type="button"
                data-ocid="chat.retry_button"
                onClick={onRetry}
                className="mt-3 flex items-center gap-1.5 rounded-xl bg-destructive px-3 py-1.5 text-xs font-bold text-destructive-foreground shadow-subtle transition-smooth hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Coba Lagi</span>
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
