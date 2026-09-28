"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Loader2, Save } from "lucide-react";
import type { Note } from "@/lib/types";

interface NoteEditorProps {
  note: Note | null;
  saving: boolean;
  error: string | null;
  onTitleChange: (title: string) => void;
  onContentChange: (content: string) => void;
  onSave: () => void;
}

export function NoteEditor({
  note,
  saving,
  error,
  onTitleChange,
  onContentChange,
  onSave,
}: NoteEditorProps) {
  const [dirty, setDirty] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reset dirty state when switching notes
  useEffect(() => {
    setDirty(false);
  }, [note?.id]);

  useEffect(() => {
    return () => {
      if (flashTimer.current) clearTimeout(flashTimer.current);
    };
  }, []);

  const handleSave = () => {
    onSave();
    setDirty(false);
    setSavedFlash(true);
    if (flashTimer.current) clearTimeout(flashTimer.current);
    flashTimer.current = setTimeout(() => setSavedFlash(false), 2000);
  };

  if (!note) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <p className="max-w-sm text-center text-sm text-muted-foreground">
          Select a note from the list, or create a new one, to start writing.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center gap-3 border-b border-border px-5 py-3">
        <input
          type="text"
          value={note.title}
          onChange={(e) => {
            onTitleChange(e.target.value);
            setDirty(true);
          }}
          placeholder="Note title"
          className="min-w-0 flex-1 bg-transparent text-lg font-semibold text-foreground outline-none placeholder:text-muted-foreground"
        />
        <div className="flex items-center gap-2">
          {savedFlash && (
            <span className="inline-flex items-center gap-1 text-xs text-emerald-500">
              <Check className="h-3.5 w-3.5" /> Saved
            </span>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !dirty}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>

      {error && (
        <div className="mx-5 mt-3 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      <textarea
        value={note.content}
        onChange={(e) => {
          onContentChange(e.target.value);
          setDirty(true);
        }}
        placeholder="Write your note here… (you can translate it with the AI panel on the right)"
        className="min-h-0 flex-1 resize-none bg-transparent px-5 py-4 text-[15px] leading-7 text-foreground outline-none placeholder:text-muted-foreground"
      />

      <div className="flex items-center justify-between border-t border-border px-5 py-2 text-xs text-muted-foreground">
        <span>
          {note.content.length.toLocaleString()} characters
        </span>
        <span>
          Last updated{" "}
          {new Intl.DateTimeFormat(undefined, {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }).format(new Date(note.updated_at))}
        </span>
      </div>
    </div>
  );
}
