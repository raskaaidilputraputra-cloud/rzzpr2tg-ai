import { ThemeToggle } from "@/components/ThemeToggle";
import { Menu } from "lucide-react";

interface ChatHeaderProps {
  title: string;
  onOpenSidebar: () => void;
}

export function ChatHeader({ title, onOpenSidebar }: ChatHeaderProps) {
  return (
    <header
      data-ocid="chat.header"
      className="z-10 flex h-16 shrink-0 items-center justify-between border-b border-border px-4 glass-panel"
    >
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          data-ocid="chat.open_sidebar_button"
          onClick={onOpenSidebar}
          aria-label="Buka menu"
          className="rounded-lg p-2 text-muted-foreground transition-smooth hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:hidden"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>
        <div className="min-w-0">
          <h2
            data-ocid="chat.title"
            className="max-w-xs truncate text-sm font-bold text-foreground sm:max-w-md sm:text-base"
          >
            {title}
          </h2>
          <span className="flex items-center gap-1 text-[10px] font-semibold text-success">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" />
            <span>Gemini API Connected</span>
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />
      </div>
    </header>
  );
}
