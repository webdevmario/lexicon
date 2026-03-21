# Lexicon

A crisp, modern desktop word companion for discovering, saving, and mastering vocabulary. Built as a local-first app — your words stay on your machine.

## Features

- **Discover** — Word of the Day with curated selections, plus exploration chips
- **Look Up** — Instant search with rich definitions, phonetics, synonyms, antonyms, and etymology
- **Save** — Heart words to your personal collection with mastery tracking
- **Practice** — Quiz mode that generates questions from your saved words, auto-updating mastery levels
- **Pronunciation** — Audio playback for any word with available phonetics

## Tech Stack

- **React 19** + TypeScript
- **Vite** for blazing fast dev/build
- **Zustand** for state management with localStorage persistence
- **TanStack Query** for API caching
- **Framer Motion** for fluid animations
- **CSS Modules** for scoped, maintainable styles
- **Free Dictionary API** — no API key required

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server (opens http://localhost:3000)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Scripts

| Command              | Description                        |
| -------------------- | ---------------------------------- |
| `npm run dev`        | Start Vite dev server              |
| `npm run build`      | Type-check + production build      |
| `npm run preview`    | Serve production build locally     |
| `npm run lint`       | Run ESLint with auto-fix           |
| `npm run format`     | Format all source with Prettier    |
| `npm run typecheck`  | TypeScript type checking only      |

## VS Code Setup

The project includes `.vscode/settings.json` and `.vscode/extensions.json` for a smooth experience:

- Auto-format on save (Prettier)
- Auto-fix lint issues on save (ESLint)
- Path alias intellisense (`@/` maps to `src/`)

Recommended extensions will be suggested on first open.

## Project Structure

```
src/
├── components/     # Reusable UI components
│   ├── Shell       # App layout with sidebar navigation
│   ├── SearchInput # Search bar component
│   ├── WordCard    # Rich word definition display
│   ├── WordChip    # Clickable word tags
│   └── EmptyState  # Placeholder for empty views
├── hooks/          # Custom React hooks
│   ├── useWordLookup   # Dictionary API with caching
│   └── useAudioPlayer  # Pronunciation audio playback
├── lib/            # Pure utility functions
│   ├── api         # Dictionary API client
│   ├── quiz        # Quiz question generator
│   └── wotd        # Word of the Day logic
├── pages/          # Route-level page components
│   ├── DiscoverPage    # Home / Word of the Day
│   ├── SearchPage      # Word lookup
│   ├── SavedPage       # Saved words collection
│   └── PracticePage    # Quiz mode
├── stores/         # Zustand state stores
│   └── wordStore   # Saved words + mastery state
└── types/          # TypeScript type definitions
```

## License

Personal use.
