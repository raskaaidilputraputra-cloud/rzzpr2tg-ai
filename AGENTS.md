# Project Guidance

## User Preferences

- Preserve the existing RzzPr2tg Ai design and layout exactly; do not restyle other features
- Interface language is Indonesian
- Dark theme is the default
- Google login and all other login options must work properly
- The 'Cek API Key' action belongs in the main menu, not in Settings
- Include a 'Hubungi Owner' link to https://wa.me/62881022762735

## Verified Commands

- **typecheck**: `pnpm typecheck`
- **fix**: `pnpm fix`
- **build**: `pnpm build`

## Learnings

- The Caffeine Inference client returns the complete completion in a single outcall; token-by-token model streaming is not available through it. Return the reply as ordered chunks from one update call and render them incrementally on the client.
- Local preflight cannot exercise a real inference reply because CAFFEINE_INFERENCE_API_KEY is not set in the local environment; the chat send path traps with IC0503 there. This is an external boundary, not an app bug.
- Layout gates both Header and Footer off the /chat route via useRouterState so the chat shell owns its full viewport height.
- The platform's only supported sign-in is Internet Identity; email/password forms must route through auth.login() with honest Indonesian info toasts rather than faking success.
- Biome rejects role="dialog" on a div — use a native <dialog open> element for modals.
- Backend MessageRole is a value enum: import MessageRole as a value from @/backend, not a string literal union.
- Motoko has no triple-quoted string literal; multi-line Markdown docs must be single-line Text with \n escapes.
- Time.now() returns Int — convert with Int.abs(Time.now()) for Nat timestamp fields.
- When mops check reports too many pending migrations for check-limit=1, fold later changes into the earliest pending file and delete the duplicate rather than raising check-limit.
- Layout gates both Header and Footer off the /chat route via useRouterState so the chat shell owns its full viewport height; ChatPage must use h-screen, not calc(100vh-4rem).
- Biome rejects role="dialog" on a div — use a native <dialog open> element for modals, with a manual focus trap.
- When the backend appends every request.messages entry to an existing conversation, the frontend must send only the new user turn once a conversationId exists; send full history only for the first turn.
- A pending flag set before a non-throwing async identity call must be reset on modal close and when the identity flow settles, not only in catch.
- Scope React Query keys by principal so a different signed-in user never sees the previous user's cached data.
