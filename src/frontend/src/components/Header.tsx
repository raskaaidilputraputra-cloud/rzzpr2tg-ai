import { AuthModal } from "@/components/AuthModal";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/context/AuthContext";
import { Link } from "@tanstack/react-router";
import { Brain } from "lucide-react";
import { useState } from "react";

export function Header() {
  const { isAuthenticated } = useAuth();
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  return (
    <header
      data-ocid="header"
      className="sticky top-0 z-40 w-full border-b border-border bg-card/80 px-6 py-4 backdrop-blur-xl"
    >
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between">
        <Link
          to="/"
          data-ocid="header.logo_link"
          className="flex items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground shadow-glow">
            <Brain className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="flex flex-col leading-tight">
            <span className="bg-gradient-primary bg-clip-text text-xl font-bold tracking-tight text-transparent">
              RzzPr2tg Ai
            </span>
            <span className="text-xs font-medium text-muted-foreground">
              Smart AI Assistant
            </span>
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          {!isAuthenticated && (
            <button
              type="button"
              data-ocid="header.login_button"
              onClick={() => setIsAuthOpen(true)}
              className="hidden rounded-xl px-4 py-2 text-sm font-semibold text-foreground transition-smooth hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:inline-flex"
            >
              Login
            </button>
          )}
          <Link
            to="/chat"
            data-ocid="header.start_chat_button"
            className="inline-flex items-center rounded-xl bg-skybrand-600 px-4 py-2 text-sm font-semibold text-primary-foreground shadow-subtle transition-smooth hover:bg-skybrand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Start Chatting
          </Link>
        </div>
      </div>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </header>
  );
}
