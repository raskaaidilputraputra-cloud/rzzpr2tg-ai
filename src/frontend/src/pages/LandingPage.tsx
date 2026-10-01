import { AuthModal } from "@/components/AuthModal";
import type { FeatureCard } from "@/types/app";
import { Link } from "@tanstack/react-router";
import { Bolt, Bot, History, LogIn, Zap } from "lucide-react";
import { useState } from "react";

const FEATURE_CARDS: FeatureCard[] = [
  {
    icon: "bot",
    title: "AI Chat & Coding",
    description:
      "Context-aware conversations, programming help in multiple languages, and instant problem-solving.",
  },
  {
    icon: "bolt",
    title: "Fast Backend API",
    description:
      "Secure server-side proxy integration with complete error handling and auto-retry capabilities.",
  },
  {
    icon: "history",
    title: "Cloud History",
    description:
      "Secure conversation storage so you never lose your important chats.",
  },
];

const FEATURE_ICONS = {
  bot: Bot,
  bolt: Zap,
  history: History,
} as const;

export function LandingPage() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  return (
    <div data-ocid="landing.page" className="flex flex-col">
      <section className="mx-auto flex w-full max-w-5xl flex-col items-center px-6 py-16 text-center">
        <div
          data-ocid="landing.hero_badge"
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-skybrand-500/30 bg-skybrand-500/10 px-3.5 py-1.5 text-xs font-semibold text-skybrand-300 animate-fade-in-up"
        >
          <span className="h-2 w-2 rounded-full bg-skybrand-500 animate-pulse" />
          <span>Powered by Advanced Gemini AI Engine</span>
        </div>

        <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-foreground animate-fade-in-up sm:text-6xl">
          Meet{" "}
          <span className="bg-gradient-to-r from-skybrand-600 via-skybrand-500 to-accent bg-clip-text text-transparent">
            RzzPr2tg Ai
          </span>
        </h1>

        <p className="mb-4 text-xl font-semibold text-skybrand-300 sm:text-2xl">
          &ldquo;Your Smart AI Assistant&rdquo;
        </p>

        <p className="mb-10 max-w-2xl text-base text-muted-foreground sm:text-lg">
          Ask anything, get intelligent answers, analyze code, brainstorm ideas,
          and explore limitless possibilities with RzzPr2tg Ai.
        </p>

        <div className="mb-16 flex w-full max-w-md flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            to="/chat"
            data-ocid="landing.guest_button"
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-skybrand-600 px-8 py-3.5 font-bold text-primary-foreground shadow-glow transition-smooth hover:-translate-y-0.5 hover:bg-skybrand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:w-auto"
          >
            <Bolt className="h-4 w-4" aria-hidden="true" />
            Continue as Guest
          </Link>
          <button
            type="button"
            data-ocid="landing.login_button"
            onClick={() => setIsAuthOpen(true)}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-border px-8 py-3.5 font-bold text-foreground transition-smooth hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:w-auto"
          >
            <LogIn className="h-4 w-4" aria-hidden="true" />
            Login / Register
          </button>
        </div>

        <div className="grid w-full grid-cols-1 gap-6 text-left md:grid-cols-3">
          {FEATURE_CARDS.map((card) => {
            const Icon = FEATURE_ICONS[card.icon];
            return (
              <article
                key={card.title}
                data-ocid="landing.feature_card"
                className="rounded-2xl border border-border bg-card p-6 shadow-subtle transition-smooth hover:-translate-y-1 hover:border-skybrand-500/50 hover:shadow-elevated"
              >
                <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-skybrand-500/10 text-skybrand-400">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="mb-2 text-lg font-bold text-foreground">
                  {card.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {card.description}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  );
}
