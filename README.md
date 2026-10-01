# Notely — AI note taking

> A note-taking app with AI translation, built with **Next.js 16 (App Router)**, **TypeScript**, **Tailwind CSS v4**, and **Supabase** as the database. Features a vibrant gradient design system and user-selectable **light / dark mode**.

## Features

- 📝 Create, edit, and delete notes (persisted in Supabase Postgres)
- 🌐 AI translation of the current note into **18 languages** via OpenRouter (key stays server-side)
- 🌗 Light / dark / system theme toggle (persisted in `localStorage` via `next-themes`)
- 🎨 Vibrant gradient design system — purple→coral primary, purple→cyan accent, glow buttons, smooth micro-interactions
- ⚡ Fast, responsive three-pane layout: notes list · editor · AI translate panel
- 📊 Vercel Speed Insights for Core Web Vitals monitoring

## Tech stack

| Layer      | Tech                                        |
| ---------- | ------------------------------------------- |
| Framework  | Next.js 16 (App Router, Turbopack) + React 19 |
| Styling    | Tailwind CSS v4 + `next-themes`             |
| Database   | Supabase (Postgres + Row Level Security)    |
| AI         | OpenRouter (OpenAI-compatible) chat completions |
| Icons      | `lucide-react`                              |
| Analytics  | `@vercel/speed-insights`                    |

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Create a Supabase project

1. Create a free project at [supabase.com/dashboard](https://supabase.com/dashboard).
2. Open the **SQL editor** and run the contents of [`supabase/schema.sql`](supabase/schema.sql). This creates the `notes` table, an `updated_at` trigger, and permissive RLS policies (single-user local app).
3. Copy your **Project URL** and **publishable key** from *Project Settings → API*.

### 3. Configure environment variables

```bash
cp .env.example .env.local
```

Fill in:

```env
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxx
SUPABASE_SECRET_KEY=sb_secret_xxx
OPENROUTER_API_KEY=sk-or-v1-xxx
# Optional: OPENROUTER_MODEL=openai/gpt-4o-mini
```

> `OPENROUTER_API_KEY` is only used server-side by `/api/translate` and is never exposed to the browser.
>
> **Note:** These variables are intentionally **not** prefixed with `NEXT_PUBLIC_` — they are only read on the server (API routes). The browser talks to Supabase exclusively through `/api/notes`.

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 5. Production build

```bash
npm run build
npm start
```

## Project structure

```
src/
  app/
    page.tsx                 # Main three-pane UI (list / editor / translate)
    layout.tsx               # Root layout + ThemeProvider + SpeedInsights
    globals.css              # Tailwind v4 theme tokens + gradient/glow utilities
    api/
      notes/route.ts         # GET list, POST create
      notes/[id]/route.ts    # GET, PUT, DELETE single note
      translate/route.ts     # POST — OpenRouter translation
  components/
    notes-list.tsx           # Sidebar note list
    note-editor.tsx          # Title + content editor with save state
    translate-panel.tsx      # Language picker + AI translation result
    theme-provider.tsx       # next-themes wrapper
    theme-toggle.tsx         # Light/dark toggle button
  lib/
    languages.ts             # 18 supported target languages
    types.ts                 # Shared types
supabase/
  schema.sql                 # Database schema + RLS policies
```

## API

| Method | Route             | Description                          |
| ------ | ----------------- | ------------------------------------ |
| GET    | `/api/notes`      | List notes (newest updated first)    |
| POST   | `/api/notes`      | Create a note `{ title, content }`   |
| GET    | `/api/notes/:id`  | Fetch one note                       |
| PUT    | `/api/notes/:id`  | Update title/content                 |
| DELETE | `/api/notes/:id`  | Delete a note                        |
| POST   | `/api/translate`  | `{ text, targetLanguage }` → `{ translation, model }` |

## Design system

The app uses a **vibrant gradient design system** defined in `src/app/globals.css`:

### Color tokens (oklch)

| Token              | Light                          | Dark                          |
| ------------------ | ------------------------------ | ----------------------------- |
| `--primary`        | Purple `oklch(0.55 0.25 300)`  | Purple `oklch(0.65 0.25 300)` |
| `--secondary`      | Cyan `oklch(0.6 0.2 200)`      | Cyan `oklch(0.65 0.2 200)`    |
| `--success`        | Green `oklch(0.65 0.18 160)`   | Green `oklch(0.7 0.18 160)`   |
| `--warning`        | Amber `oklch(0.75 0.16 80)`    | Amber `oklch(0.8 0.16 80)`    |
| `--destructive`    | Red `oklch(0.6 0.22 25)`       | Red `oklch(0.65 0.22 25)`     |

### Gradient utilities

| Class                  | Effect                                          |
| ---------------------- | ----------------------------------------------- |
| `.bg-gradient-primary` | Purple → Coral (135°) — primary buttons         |
| `.bg-gradient-accent`  | Purple → Cyan (135°) — accent badges            |
| `.text-gradient`       | Gradient text (logo, headings)                  |

### Micro-interaction utilities

| Class                | Effect                                              |
| -------------------- | --------------------------------------------------- |
| `.btn-glow`          | Colored box-shadow glow + lift on hover             |
| `.card-lift`         | Subtle translateY + shadow on hover                 |
| `.transition-smooth` | Consistent `cubic-bezier(0.4, 0, 0.2, 1)` easing    |

### Conventions

- **Primary actions** (New, Save, Translate, Got it) → `bg-gradient-primary` + `btn-glow`
- **Accent badges** (AI Translate icon) → `bg-gradient-accent`
- **Success states** (Saved, Copied) → `text-success`
- **Error states** → `text-destructive` + `bg-destructive/10`
- **Warning states** (Setup required) → `text-warning-foreground` + `bg-warning/10`
- **Hover states** → `transition-smooth` + `hover:bg-accent` or `hover:border-primary/40`

## Notes

- The app is designed as a **single-user local tool**: RLS policies are permissive. For multi-user deployment, add an `owner_id` column and scope policies to `auth.uid()` (see comment in `supabase/schema.sql`).
- Translation uses `qwen 3.8 27b : free` via OpenRouter by default; override with the `OPENROUTER_MODEL` env var (e.g. `anthropic/claude-3.5-haiku`, `google/gemini-flash-1.5`).
- The translate API returns **plain translated text** (no JSON wrapper) — the model is instructed to respond with only the translation.
- Vercel Speed Insights is wired up in `src/app/layout.tsx` via `<SpeedInsights />`.

- This app is developed via the use of : `qwen 3.8 27b` running locally
