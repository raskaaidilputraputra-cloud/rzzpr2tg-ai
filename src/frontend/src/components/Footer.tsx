import { MessageCircle } from "lucide-react";

const OWNER_WHATSAPP_URL = "https://wa.me/62881022762735";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      data-ocid="footer"
      className="w-full border-t border-border bg-background py-6"
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 px-6 text-sm text-muted-foreground sm:flex-row">
        <p>
          &copy; {year} RzzPr2tg Ai. All rights reserved. Your Smart AI
          Assistant.
        </p>
        <div className="flex items-center gap-4">
          <a
            data-ocid="footer.owner_link"
            href={OWNER_WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-medium text-muted-foreground transition-smooth hover:text-skybrand-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
            Hubungi Owner
          </a>
          <a
            data-ocid="footer.attribution_link"
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-smooth hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Built with love using caffeine.ai
          </a>
        </div>
      </div>
    </footer>
  );
}
