Create a new page in this Lexicon app.

Page name: $ARGUMENTS

Follow the existing patterns exactly:

1. Create `src/pages/<PageName>Page.tsx` — a React component that exports as default. Use the same animation and layout patterns as the existing pages (DiscoverPage, SavedPage, PracticePage). Import from `@/` aliases.

2. Create `src/pages/<PageName>Page.module.css` — a CSS Module file. Use only existing CSS variables from `src/index.css` for colors, spacing, radius, shadows, fonts. Never hardcode values.

3. Add a route in `src/App.tsx` — add a `<Route path="<pagename>" element={<PageNamePage />} />` inside the Shell route. Import the new page component.

4. Add a nav item in `src/components/Shell.tsx` — pick an appropriate Lucide icon and add an entry to the `NAV_ITEMS` array with the correct path and label.

Before writing code, read the following files to understand the conventions:
- `src/pages/DiscoverPage.tsx` and its `.module.css` (for page structure patterns)
- `src/components/Shell.tsx` (for nav item format)
- `src/App.tsx` (for routing)
- `src/index.css` (for available CSS variables)

The page should have a header with the page title, and appropriate empty/placeholder content. Keep it minimal — just the scaffold, ready to build on.
