# Notely — AI note taking

(useless fact: this app is created using qwen 3.8 27B models running locally for project evalution on utilizing local agents )

A note taking app with an AI translation feature, built with **Next.js 16 (App Router)**, **TypeScript**, **Tailwind CSS v4**, and **Supabase** as the database. Includes user-selectable **light / dark mode**.

## Features

- 📝 Create, edit, and delete notes (persisted in Supabase Postgres)
- 🌐 AI translation of the current note into 18 languages via the OpenAI API (key stays server-side)
- 🌗 Light / dark / system theme toggle (persisted in `localStorage` via `next-themes`)
- ⚡ Fast, responsive three-pane layout: notes list · editor · AI translate panel

## Tech stack

| Layer      | Tech                                        |
| ---------- | ------------------------------------------- |
| Framework  | Next.js 16 (App Router) + React 19          |
| Styling    | Tailwind CSS v4 + `next-themes`             |
| Database   | Supabase (Postgres + Row Level Security)    |
| AI         | OpenRouter (OpenAI-compatible) chat completions |
| Icons      | `lucide-react`                              |

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Create a Supabase project

1. Create a free project at [supabase.com/dashboard](https://supabase.com/dashboard).
2. Open the **SQL editor** and run the contents of [`supabase/schema.sql`](supabase/schema.sql). This creates the `notes` table, an `updated_at` trigger, and permissive RLS policies (single-user local app).
3. Copy your **Project URL** and **anon key** from *Project Settings → API*.

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
```

> `OPENROUTER_API_KEY` is only used server-side by `/api/translate` and is never exposed to the browser.

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project structure

```
src/
  app/
    page.tsx                 # Main three-pane UI (list / editor / translate)
    layout.tsx               # Root layout + ThemeProvider
    globals.css              # Tailwind v4 theme tokens (light & dark)
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
    languages.ts             # Supported target languages
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
| POST   | `/api/translate`  | `{ text, targetLanguage }` → AI translation |

## Notes

- The app is designed as a **single-user local tool**: RLS policies are permissive. For multi-user deployment, add an `owner_id` column and scope policies to `auth.uid()` (see comment in `supabase/schema.sql`).
- Translation uses `openai/gpt-4o-mini` via OpenRouter by default; override with the `OPENROUTER_MODEL` env var (e.g. `anthropic/claude-3.5-haiku`).
