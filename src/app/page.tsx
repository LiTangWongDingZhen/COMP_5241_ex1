"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { NotebookPen, Settings2 } from "lucide-react";
import { NotesList } from "@/components/notes-list";
import { NoteEditor } from "@/components/note-editor";
import { TranslatePanel } from "@/components/translate-panel";
import { ThemeToggle } from "@/components/theme-toggle";
import type { Note } from "@/lib/types";

export default function Home() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notConfigured, setNotConfigured] = useState(false);
  const [showSetup, setShowSetup] = useState(false);

  const selectedNote = useMemo(
    () => notes.find((n) => n.id === selectedId) ?? null,
    [notes, selectedId]
  );

  const loadNotes = useCallback(async () => {
    try {
      const res = await fetch("/api/notes", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) {
        const msg = data.error ?? "Failed to load notes.";
        if (msg.includes("not configured")) setNotConfigured(true);
        throw new Error(msg);
      }
      setNotes(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load notes."); 
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadNotes();
  }, [loadNotes]);

  // Auto-select the first note once loaded
  useEffect(() => {
    if (!loading && notes.length > 0 && !selectedId) {
      setSelectedId(notes[0].id);
    }
  }, [loading, notes, selectedId]);

  async function createNote() {
    setError(null);
    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "", content: "" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to create note.");
      setNotes((prev) => [data, ...prev]);
      setSelectedId(data.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create note.");
    }
  }

  async function saveNote() {
    if (!selectedNote) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/notes/${selectedNote.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: selectedNote.title,
          content: selectedNote.content,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to save note.");
      setNotes((prev) =>
        prev.map((n) => (n.id === data.id ? data : n))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save note.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteNote(id: string) {
    const note = notes.find((n) => n.id === id);
    const label = note?.title?.trim() || "this note";
    if (!window.confirm(`Delete ${label}? This cannot be undone.`)) return;

    setError(null);
    try {
      const res = await fetch(`/api/notes/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to delete note.");
      }
      setNotes((prev) => {
        const next = prev.filter((n) => n.id !== id);
        if (selectedId === id) setSelectedId(next[0]?.id ?? null);
        return next;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete note.");
    }
  }

  function updateSelected(patch: Partial<Pick<Note, "title" | "content">>) {
    if (!selectedId) return;
    setNotes((prev) =>
      prev.map((n) => (n.id === selectedId ? { ...n, ...patch } : n))
    );
  }

  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-border bg-card px-4 py-2.5 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary text-white shadow-md">
            <NotebookPen className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-extrabold leading-tight tracking-tight text-gradient">
              Notely
            </h1>
            <p className="text-[11px] leading-tight text-muted-foreground">
              Notes + AI translation
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {notConfigured && (
            <button
              type="button"
              onClick={() => setShowSetup(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-warning/40 bg-warning/10 px-3 py-1.5 text-xs font-medium text-warning-foreground transition-smooth hover:bg-warning/20"
            >
              <Settings2 className="h-3.5 w-3.5" />
              Setup required
            </button>
          )}
          <ThemeToggle />
        </div>
      </header>

      {/* Body */}
      <div className="flex min-h-0 flex-1">
        {/* Notes list */}
        <aside className="w-72 shrink-0 border-r border-border bg-card/50">
          <NotesList
            notes={notes}
            selectedId={selectedId}
            loading={loading}
            onSelect={setSelectedId}
            onCreate={createNote}
            onDelete={deleteNote}
          />
        </aside>

        {/* Editor */}
        <main className="min-w-0 flex-1 bg-background">
          <NoteEditor
            note={selectedNote}
            saving={saving}
            error={error}
            onTitleChange={(title) => updateSelected({ title })}
            onContentChange={(content) => updateSelected({ content })}
            onSave={saveNote}
          />
        </main>

        {/* Translate panel */}
        <aside className="hidden w-80 shrink-0 border-l border-border bg-card/50 md:block">
          <TranslatePanel sourceText={selectedNote?.content ?? ""} />
        </aside>
      </div>

      {/* Setup modal */}
      {showSetup && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setShowSetup(false)}
        >
          <div
            className="max-w-lg rounded-xl border border-border bg-card p-5 text-foreground shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-base font-semibold">
              Connect your Supabase project
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Notely stores notes in Supabase. To get started:
            </p>
            <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm text-muted-foreground">
              <li>
                Create a free project at{" "}
                <a
                  href="https://supabase.com/dashboard"
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary underline"
                >
                  supabase.com
                </a>
              </li>
              <li>
                Open the SQL editor and run{" "}
                <code className="rounded bg-muted px-1 py-0.5 text-xs">
                  supabase/schema.sql
                </code>{" "}
                from this repo
              </li>
              <li>
                Copy your{" "}
                <code className="rounded bg-muted px-1 py-0.5 text-xs">
                  SUPABASE_URL
                </code>{" "}
                and{" "}
                <code className="rounded bg-muted px-1 py-0.5 text-xs">
                  SUPABASE_PUBLISHABLE_KEY
                </code>{" "}
                into{" "}
                <code className="rounded bg-muted px-1 py-0.5 text-xs">
                  .env.local
                </code>{" "}
                (see <code className="rounded bg-muted px-1 py-0.5 text-xs">.env.example</code>)
              </li>
              <li>
                Add your OpenRouter key as{" "}
                <code className="rounded bg-muted px-1 py-0.5 text-xs">
                  OPENROUTER_API_KEY
                </code>{" "}
                for the AI translation feature
              </li>
              <li>Restart the dev server</li>
            </ol>
            <button
              type="button"
              onClick={() => setShowSetup(false)}
              className="mt-4 w-full rounded-lg bg-gradient-primary px-4 py-2 text-sm font-semibold text-white btn-glow"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
