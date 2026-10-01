import { Send, Square } from "lucide-react";
import { type KeyboardEvent, useEffect, useRef, useState } from "react";

interface ChatComposerProps {
  onSend: (text: string) => void;
  onStop: () => void;
  isGenerating: boolean;
}

const MAX_LENGTH = 12000;

export function ChatComposer({
  onSend,
  onStop,
  isGenerating,
}: ChatComposerProps) {
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: text drives the textarea auto-resize
  useEffect(() => {
    const node = textareaRef.current;
    if (!node) return;
    node.style.height = "auto";
    node.style.height = `${Math.min(node.scrollHeight, 150)}px`;
  }, [text]);

  const submit = () => {
    const trimmed = text.trim();
    if (!trimmed || isGenerating) return;
    onSend(trimmed);
    setText("");
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  };

  return (
    <div className="shrink-0 border-t border-border p-4 glass-panel">
      <div className="relative mx-auto flex max-w-4xl items-end rounded-2xl border border-input bg-card p-2 shadow-subtle">
        <textarea
          ref={textareaRef}
          data-ocid="chat.textarea"
          rows={1}
          value={text}
          maxLength={MAX_LENGTH}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Tanyakan apa saja ke RzzPr2tg Ai... (Enter untuk kirim, Shift+Enter baris baru)"
          aria-label="Tulis pesan"
          className="max-h-36 flex-1 resize-none border-none bg-transparent p-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground"
        />

        <div className="flex items-center gap-1 pb-1 pr-1">
          {isGenerating ? (
            <button
              type="button"
              data-ocid="chat.stop_button"
              onClick={onStop}
              title="Hentikan"
              aria-label="Hentikan pembuatan jawaban"
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive text-destructive-foreground shadow-subtle transition-smooth hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Square className="h-4 w-4" aria-hidden="true" />
            </button>
          ) : (
            <button
              type="button"
              data-ocid="chat.send_button"
              onClick={submit}
              disabled={!text.trim()}
              title="Kirim"
              aria-label="Kirim pesan"
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-skybrand-600 text-primary-foreground shadow-subtle transition-smooth hover:bg-skybrand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
      <div className="mt-2 text-center">
        <span className="text-[10px] text-muted-foreground">
          RzzPr2tg Ai can make mistakes. Verify important info.
        </span>
      </div>
    </div>
  );
}
