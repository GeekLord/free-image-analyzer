---
inclusion: always
---

# Image Analyzer

Client-only React SPA that evaluates an uploaded image for content safety (SightEngine) and searches the web for matching sources (Google Custom Search). There is no backend: all API calls go directly from the browser.

## Stack

- Vite 6 + React 18 + TypeScript 5 (`strict`, `noUnusedLocals`, `noUnusedParameters`)
- Tailwind CSS 3 with `darkMode: 'class'`
- `axios` for HTTP, `lucide-react` for icons, `react-dropzone` for uploads, `react-hot-toast` for notifications
- Deployed to Netlify (`netlify.toml`, `public/_redirects`, publish dir `dist`)

## Commands

- `npm run dev` — dev server (never run this in an automated/blocking step; tell the user to run it)
- `npm run build` — typecheck then build; use this to verify changes
- `npm run preview` — serve the production build

No test runner and no linter are configured. Do not add either unless the user asks.

## Architecture

```
src/
  main.tsx          React root, StrictMode, imports index.css
  App.tsx           Owns image/analysis state, orchestrates the flow
  components/       Presentational + locally-stateful UI
  context/          ThemeContext provider + useTheme hook
  services/api.ts   All external HTTP calls live here
  types/index.ts    All shared interfaces live here
```

State flow: `App` holds `imageUrl`, `imageDetails`, `nsfwAnalysis`, `isLoading` and passes them down as props. `ImageUploader` reports a `File` upward via `onImageSelect`. `AnalysisResults` owns its own source-search state and calls `findImageSources` itself. Keep this shape — no global state library, no prop drilling beyond one level.

Rules:
- Put every network call in `src/services/api.ts`. Components import functions from it; they never call `axios` directly.
- Put every shared interface in `src/types/index.ts`. Do not redeclare types locally if a shared one exists.
- Component-local prop interfaces (`ImageUploaderProps`, `AnalysisResultsProps`) stay in the component file.

## Code style

- Named function declarations for components and exported helpers: `export function AnalysisResults({ ... }: AnalysisResultsProps)`. No `React.FC`, no default exports for components (`App.tsx` keeps its default export for compatibility).
- Named exports everywhere else.
- Explicit types on props, return values, and `useState` where inference is not obvious.
- Relative imports (`../types`, `./components/ThemeToggle`); no path aliases are configured.
- Single quotes, semicolons, 2-space indent.
- Wrap callbacks passed to children in `useCallback` when they feed into dropzone/paste handlers, matching `ImageUploader`.
- `lucide-react` is in `optimizeDeps.exclude`; keep it that way.

## Styling

- Tailwind utility classes inline. No CSS modules, no styled-components.
- Every color/background/border utility needs a `dark:` counterpart. Custom dark tokens: `dark-bg`, `dark-card`, `dark-border` (see `tailwind.config.js`).
- Accent color is blue (`blue-500`/`blue-600`, `dark:blue-400`).
- Interactive elements need visible focus rings (`focus:outline-none focus:ring-2 focus:ring-blue-500`) and an `aria-label` when the control is icon-only.
- Custom animation helpers (`animate-fadeIn`, `animation-delay-200/400`) live in `src/index.css`; add new keyframes there rather than inline.

## API and error handling

- Config comes from `import.meta.env.VITE_*`: `VITE_SIGHTENGINE_USER`, `VITE_SIGHTENGINE_SECRET`, `VITE_GOOGLE_API_KEY`, `VITE_GOOGLE_CX`.
- Vite inlines `VITE_*` values into the client bundle, so these are publicly visible by design. Never introduce new hardcoded credential fallbacks in source, and flag the existing ones in `services/api.ts` and `.env.example` if the user touches that area.
- `analyzeImage` throws on failure; the caller catches and shows `toast.error`.
- `findImageSources` never throws. It returns `SearchResponse` with `sources`, optional `error`, and `isApiKeyMissingOrExpired`, so a missing key degrades into an in-UI notice instead of a crash. Preserve this pattern for search-related calls.
- Log with `console.error` for real failures and `console.warn` for expected/recoverable API notices.

## Safety scoring

Thresholds in `analyzeImage` define the NSFW verdict: nudity > 0.4, suggestive > 0.6, violence > 0.5; `confidence` is the max of the three. Do not change these values or the `details` shape (`nudity`, `suggestive`, `violence`) without the user asking, since `AnalysisResults` renders directly against them.

## Product conventions

- Three upload paths must all keep working: file dialog, drag-and-drop, and clipboard paste (`Ctrl+V` / `Cmd+V`).
- Accepted formats: PNG, JPG, JPEG, GIF, WEBP, one file at a time.
- Previews use `URL.createObjectURL`; image dimensions and aspect ratio are read client-side in `App.tsx`.
- The source-search query is seeded from the filename (extension stripped, dashes/underscores to spaces) and stays user-editable.
- User-facing copy is plain and specific. Confirmations go through `toast.success`, failures through `toast.error`, and API/config problems render as inline notices.
