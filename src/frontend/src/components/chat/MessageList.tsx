import {
  type ChatMessageView,
  MessageBubble,
} from "@/components/chat/MessageBubble";
import { cn } from "@/lib/utils";
import { Brain, Code2, Lightbulb } from "lucide-react";
import { useEffect, useRef } from "react";

interface MessageListProps {
  messages: ChatMessageView[];
  isThinking: boolean;
  onRetry: () => void;
  onPreset: (prompt: string) => void;
}

const PRESET_PROMPTS = [
  {
    id: "ai",
    label: "Jelaskan apa itu artificial intelligence",
    prompt:
      "Jelaskan apa itu artificial intelligence dan bagaimana cara kerjanya?",
    icon: Lightbulb,
  },
  {
    id: "binary-search",
    label: "Kode Python Binary Search",
    prompt:
      "Tuliskan kode Python sederhana untuk algoritma Binary Search dengan komentar.",
    icon: Code2,
  },
] as const;

export function MessageList({
  messages,
  isThinking,
  onRetry,
  onPreset,
}: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll on new messages and thinking state
  useEffect(() => {
    const node = scrollRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [messages, isThinking]);

  const isEmpty = messages.length === 0 && !isThinking;

  return (
    <div
      ref={scrollRef}
      data-ocid="chat.message_list"
      className="flex flex-1 flex-col space-y-6 overflow-y-auto p-4 sm:p-6"
    >
      {isEmpty ? (
        <div
          data-ocid="chat.empty_state"
          className="mx-auto my-auto w-full max-w-xl px-4 py-12 text-center"
        >
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-primary text-2xl text-primary-foreground shadow-glow">
            <Brain className="h-7 w-7" aria-hidden="true" />
          </div>
          <h3 className="mb-2 text-2xl font-bold text-foreground">
            Ada yang bisa RzzPr2tg Ai bantu hari ini?
          </h3>
          <p className="mb-8 text-sm text-muted-foreground">
            Tanyakan apa saja, tulis kode, analisis data, atau jelajahi ide baru
            dalam Bahasa Indonesia maupun Inggris.
          </p>

          <div className="grid grid-cols-1 gap-3 text-left sm:grid-cols-2">
            {PRESET_PROMPTS.map((preset) => {
              const Icon = preset.icon;
              return (
                <button
                  key={preset.id}
                  type="button"
                  data-ocid={`chat.preset.${preset.id}`}
                  onClick={() => onPreset(preset.prompt)}
                  className="rounded-2xl border border-border bg-card p-4 text-xs font-medium text-card-foreground shadow-subtle transition-smooth hover:border-skybrand-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Icon
                    className={cn(
                      "mr-2 inline h-4 w-4",
                      preset.id === "ai" ? "text-warning" : "text-skybrand-500",
                    )}
                    aria-hidden="true"
                  />
                  {preset.label}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <>
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              onRetry={onRetry}
            />
          ))}

          {isThinking && (
            <div
              data-ocid="chat.loading_state"
              className="flex w-full items-start justify-start gap-3"
            >
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground"
                aria-hidden="true"
              >
                <Brain className="h-4 w-4" />
              </div>
              <div className="max-w-[85%] rounded-2xl rounded-tl-none border border-border bg-card p-4 text-sm leading-relaxed text-card-foreground shadow-subtle sm:max-w-[75%]">
                <span className="italic text-muted-foreground">
                  Sedang berpikir...
                </span>
                <span className="ml-1 inline-block h-4 w-2 animate-pulse bg-skybrand-500 align-middle" />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
