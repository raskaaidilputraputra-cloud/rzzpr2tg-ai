# Design Brief

## Direction

Sky Signal — a faithful reproduction of the RzzPr2tg Ai chatbot: a calm, premium sky-blue AI assistant with glass surfaces and a dark-first, Indonesian-language interface.

## Tone

Polished modern SaaS — restrained glassmorphism and a single confident sky-blue accent, never loud, so long chat sessions stay comfortable.

## Differentiation

A sky-blue gradient signal running through logo, CTAs, and user bubbles against deep slate glass, giving the assistant a coherent "voice" identity across landing and chat.

## Color Palette

| Token      | OKLCH          | Role                                 |
| ---------- | -------------- | ------------------------------------ |
| background | 0.129 0.042 265 | Dark default canvas (slate-950)     |
| foreground | 0.984 0.003 248 | Primary text (slate-50)             |
| card       | 0.208 0.042 265 | Glass panels, sidebar, cards (slate-900) |
| primary    | 0.685 0.148 239 | skybrand-500 #0ea5e9 — CTAs, links  |
| accent     | 0.746 0.132 236 | skybrand-400 — gradient + highlights |
| muted      | 0.279 0.041 260 | Secondary surfaces, input fills     |

## Typography

- Display: DM Sans — headings, hero, wordmark, tight tracking
- Body: DM Sans — UI labels, messages, body copy
- Mono: Geist Mono — API key fields, code
- Scale: hero `text-4xl md:text-6xl font-bold tracking-tight`, h2 `text-2xl md:text-3xl font-bold`, label `text-sm font-semibold`, body `text-sm md:text-base`

## Elevation & Depth

Layered depth: flat slate canvas → translucent glass panels with `backdrop-blur-xl` and hairline borders → soft elevated shadows; a single sky-blue glow reserved for primary CTAs.

## Structural Zones

| Zone    | Background              | Border            | Notes                                    |
| ------- | ----------------------- | ----------------- | ---------------------------------------- |
| Header  | glass-panel, sticky     | border-b          | logo + nav + "Masuk" pill                |
| Content | bg-background           | —                 | hero, 3 feature cards, chat shell        |
| Sidebar | bg-card (chat view)     | border-r          | New Chat, search, conversation list      |
| Footer  | bg-background           | border-t          | links incl. "Hubungi Owner" (WhatsApp)   |

## Spacing & Rhythm

Generous section gaps (`py-16 md:py-24`), 8px base micro-grid, `gap-6` card grids, `p-5 md:p-6` card padding, `max-w-6xl` centered container.

## Component Patterns

- Buttons: `rounded-xl`, skybrand-600→400 gradient primary with glow; ghost/outline secondary; `transition-smooth`
- Cards: `rounded-2xl` glass-panel, hairline border, skybrand icon tile
- Badges: `rounded-full` skybrand-500/10 bg with skybrand-300 text

## Motion

- Entrance: fade-in-up 0.4s ease-out on hero and cards
- Hover: lift + border/glow shift, 0.3s `transition-smooth`
- Decorative: slow ambient pulse on hero glow orb

## Constraints

- Preserve the existing RzzPr2tg Ai design and layout exactly; do not restyle other features
- Interface language is Indonesian; dark theme is the default
- Tokens only — no raw hex/rgb in components; keep `--radius` 0.625rem

## Signature Detail

The sky-blue gradient signal (logo → CTA → user bubble) as one continuous accent thread — a "voice identity" motif, not decoration.
