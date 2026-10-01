# AGENTS.md — Notely

Guidance for AI coding agents working in this repository.

## Project overview

**Notely** is a single-user note-taking app with AI translation. Three-pane layout: notes list · editor · AI translate panel. Built with Next.js 16 (App Router, Turbopack), React 19, TypeScript, Tailwind CSS v4, and Supabase (Postgres).

## Commands

| Task              | Command             |
| ----------------- | ------------------- |
| Install deps      | `npm install`       |
| Dev server        | `npm run dev`       |
| Production build  | `npm run build`     |
| Start prod server | `npm start`         |
| Lint              | `npm run lint`      |

> **Windows / PowerShell:** use `;` to chain commands, never `&&`.

## Architecture

### Data flow

```
Browser (React)
  └─ fetch("/api/notes")          →  src/app/api/notes/route.ts
  └─ fetch("/api/notes/:id")      →  src/app/api/notes/[id]/route.ts
  └─ fetch("/api/translate")      →  src/app/api/translate/route.ts
                                        └─ Supabase (serverClient)
                                        └─ OpenRouter (OpenAI SDK)
```

- **All Supabase access is server-side** (API routes). The browser never talks to Supabase directly.
- **All OpenRouter calls are server-side** (`/api/translate`). The API key is never exposed to the client.
- The browser uses `fetch()` to call the API routes — there is **no** client-side Supabase SDK.

### Key files

| File | Purpose |
| ---- | ------- |
| `src/app/page.tsx` | Main page — state management, CRUD handlers, three-pane layout |
| `src/app/layout.tsx` | Root layout — ThemeProvider, SpeedInsights |
| `src/app/globals.css` | Design tokens (oklch), gradient/glow utilities, Tailwind v4 theme |
| `src/app/api/notes/route.ts` | GET list, POST create |
| `src/app/api/notes/[id]/route.ts` | GET, PUT, DELETE single note |
| `src/app/api/translate/route.ts` | POST — OpenRouter translation |
| `src/components/notes-list.tsx` | Sidebar note list |
| `src/components/note-editor.tsx` | Title + content editor |
| `src/components/translate-panel.tsx` | Language picker + translation result |
| `src/components/theme-provider.tsx` | next-themes wrapper |
| `src/components/theme-toggle.tsx` | Light/dark toggle |
| `src/lib/languages.ts` | 18 supported languages |
| `src/lib/types.ts` | Shared TypeScript types |
| `supabase/schema.sql` | DB schema + RLS policies |

## Environment variables

| Variable | Scope | Purpose |
| -------- | ----- | ------- |
| `SUPABASE_URL` | Server | Supabase project URL |
| `SUPABASE_PUBLISHABLE_KEY` | Server | Supabase publishable key (browser-safe) |
| `SUPABASE_SECRET_KEY` | Server | Supabase secret key (fallback) |
| `OPENROUTER_API_KEY` | Server | OpenRouter API key |
| `OPENROUTER_MODEL` | Server (optional) | Override default model (`qwen 3.8 27b : free`) |

> **Critical:** These variables are **NOT** prefixed with `NEXT_PUBLIC_`. They are only read on the server. Do NOT add the `NEXT_PUBLIC_` prefix — it would expose secrets to the browser.

## Design system

### Color tokens (oklch, defined in `globals.css`)

- `--primary` — Purple (hue ~300)
- `--secondary` — Cyan (hue ~200)
- `--success` — Green (hue ~160)
- `--warning` — Amber (hue ~80)
- `--destructive` — Red (hue ~25)
- `--gradient-start` / `--gradient-end` / `--gradient-accent` — Gradient stops

### Utility classes (defined in `globals.css`)

| Class | Usage |
| ----- | ----- |
| `.bg-gradient-primary` | Primary buttons (New, Save, Translate) |
| `.bg-gradient-accent` | Accent badges (AI Translate icon) |
| `.text-gradient` | Gradient text (logo) |
| `.btn-glow` | Glow + lift on hover for primary buttons |
| `.card-lift` | Hover elevation for cards |
| `.transition-smooth` | Consistent easing for interactive elements |

### Conventions

- **Primary actions** → `bg-gradient-primary` + `btn-glow` + `text-white`
- **Success states** → `text-success`
- **Error states** → `text-destructive` + `bg-destructive/10` + `border-destructive/40`
- **Warning states** → `text-warning-foreground` + `bg-warning/10` + `border-warning/40`
- **Hover states** → `transition-smooth` + `hover:bg-accent` or `hover:border-primary/40`
- **Rounded corners** → `rounded-lg` (buttons), `rounded-xl` (cards, inputs)
- **Disabled buttons** → `disabled:opacity-50` + `disabled:cursor-not-allowed` + `disabled:shadow-none`

## Code style

- **TypeScript strict mode** — no `any`, use explicit types
- **React 19** — function components only, no class components
- **Tailwind CSS v4** — use `@theme inline` for custom tokens, `@custom-variant dark` for dark mode
- **Icons** — `lucide-react` only, no emoji icons
- **State management** — local `useState` / `useCallback` / `useMemo` in `page.tsx`; no external state library
- **API responses** — always return JSON via `NextResponse.json()`; errors use `{ error: string }` shape
- **Error handling** — try/catch in API routes; return appropriate HTTP status codes (400, 404, 500, 502)

## Important patterns

### Server-side Supabase client

```ts
// In API routes (NOT in components)
function serverClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}
```

### Translation API

- Uses OpenAI SDK with `baseURL: "https://openrouter.ai/api/v1"`
- Returns **plain translated text** (no JSON wrapper)
- Model: `OPENROUTER_MODEL` env var or `openai/gpt-4o-mini` default
- System prompt instructs the model to respond with ONLY the translated text

### Theme

- `next-themes` with `attribute="class"`, `defaultTheme="system"`
- Dark mode via `.dark` class on `<html>`
- Tailwind v4 `@custom-variant dark (&:where(.dark, .dark *))`

## Anti-patterns (do NOT do)

- ❌ Do NOT add `NEXT_PUBLIC_` prefix to env vars
- ❌ Do NOT import Supabase SDK in client components
- ❌ Do NOT use `any` type
- ❌ Do NOT use emoji as icons (use `lucide-react`)
- ❌ Do NOT use `&&` in PowerShell commands (use `;`)
- ❌ Do NOT add client-side config checks (e.g. `isSupabaseConfigured()`) — the server handles config detection
- ❌ Do NOT wrap API responses in JSON objects when plain text is expected (e.g. translation)

## Testing

- No test framework is configured. Verify changes by:
  1. `npm run build` — must pass with no errors
  2. `npm run lint` — must pass with no errors
  3. Manual testing in the browser via `npm run dev`

## Deployment

- Deploy to **Vercel** (Next.js native)
- Set environment variables in Vercel dashboard: `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`, `OPENROUTER_API_KEY`
- Vercel Speed Insights is already wired up via `<SpeedInsights />` in `layout.tsx`
