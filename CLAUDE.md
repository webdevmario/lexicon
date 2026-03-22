# Lexicon

A local-first vocabulary app for discovering, saving, and mastering words.

## Stack

- **React 19** + TypeScript, bundled with **Vite** (port 3000)
- **React Router v7** (client-side routing via `<BrowserRouter>`)
- **Zustand** for state (persisted to localStorage: `lexicon-words`, `lexicon-lists`)
- **TanStack Query** for API caching
- **Framer Motion** for animations
- **CSS Modules** (scoped `.module.css` per component) — no Tailwind
- **Lucide React** for icons
- **Free Dictionary API** (`dictionaryapi.dev`) — no API key needed

## Project layout

```
src/
  components/   # Reusable UI (WordCard, SearchModal, Shell, etc.)
  pages/        # Route-level pages (DiscoverPage, SavedPage, PracticePage)
  stores/       # Zustand stores (wordStore, listStore)
  hooks/        # Custom hooks (useWordLookup, useAudioPlayer)
  lib/          # Utilities (api.ts, wotd.ts, quiz.ts)
  types/        # TypeScript interfaces
  index.css     # Global theme variables and base styles
```

## Commands

```bash
npm run dev          # Start dev server (localhost:3000)
npm run build        # Type-check + production build (tsc -b && vite build)
npm run typecheck    # Type-check only (tsc --noEmit)
npm run lint         # ESLint with auto-fix
npm run format       # Prettier
```

## Architecture notes

- `@/` path alias maps to `src/` (configured in vite.config.ts and tsconfig)
- Routing is in `App.tsx`. The `/search` route renders DiscoverPage underneath; search is handled by a modal overlay in `Shell.tsx`
- `Shell.tsx` owns the sidebar nav and the search modal trigger (⌘K shortcut)
- Word data flows: `useWordLookup(word)` → TanStack Query → `fetchWord()` (lib/api.ts) → dictionary API
- Saved words live in `wordStore.ts`; word lists in `listStore.ts` (both Zustand + localStorage persist)
- Dark theme with violet accent — all colors via CSS custom properties in `index.css`

## Style conventions

- CSS Modules only — one `.module.css` per component, no inline styles except dynamic values
- Use existing CSS variables (`--bg-card`, `--accent`, `--space-md`, etc.) — never hardcode colors or spacing
- Fonts: `--font-display` (DM Serif Display) for headings, `--font-body` (General Sans) for UI, `--font-mono` (JetBrains Mono) for code/technical
- Animations: Framer Motion with the standard ease `[0.16, 1, 0.3, 1]`
- Icons: Lucide React, size 14-20, strokeWidth 2

## Design preferences

- Minimalistic — favor clean whitespace over dense information
- Word cards in saved view show just the word, nothing else
- Search is a modal overlay, not a page — triggered from sidebar or ⌘K
- Lists (Liked Words, Favorites, Interesting Words + custom) are a first-class concept on the Saved page
