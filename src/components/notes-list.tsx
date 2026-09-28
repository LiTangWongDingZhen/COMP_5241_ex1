"use client";

import { FileText, Plus, Trash2 } from "lucide-react";
import type { Note } from "@/lib/types";

interface NotesListProps {
  notes: Note[];
  selectedId: string | null;
  loading: boolean;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onDelete: (id: string) => void;
}

function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return "";
  }
}

export function NotesList({
  notes,
  selectedId,
  loading,
  onSelect,
  onCreate,
  onDelete,
}: NotesListProps) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center justify-between gap-2 px-4 pt-4">
        <h2 className="text-sm font-semibold text-muted-foreground">
          Notes
          <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            {notes.length}
          </span>
        </h2>
        <button
          type="button"
          onClick={onCreate}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          New
        </button>
      </div>

      <div className="mt-3 flex-1 space-y-1 overflow-y-auto px-2 pb-4">
        {loading && (
          <p className="px-2 py-4 text-sm text-muted-foreground">
            Loading notes…
          </p>
        )}

        {!loading && notes.length === 0 && (
          <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
            <FileText className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              No notes yet.
              <br />
              Create your first note to get started.
            </p>
          </div>
        )}

        {!loading &&
          notes.map((note) => {
            const active = note.id === selectedId;
            return (
              <div
                key={note.id}
                className={`group relative rounded-lg border transition-colors ${
                  active
                    ? "border-primary/40 bg-accent"
                    : "border-transparent hover:bg-muted"
                }`}
              >
                <button
                  type="button"
                  onClick={() => onSelect(note.id)}
                  className="w-full px-3 py-2.5 pr-10 text-left"
                >
                  <p
                    className={`truncate text-sm font-medium ${
                      active ? "text-foreground" : "text-foreground/90"
                    }`}
                  >
                    {note.title || "Untitled note"}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {note.content.replace(/\s+/g, " ").slice(0, 60) ||
                      "Empty note"}
                  </p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {formatDate(note.updated_at)}
                  </p>
                </button>
                <button
                  type="button"
                  aria-label={`Delete ${note.title || "note"}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(note.id);
                  }}
                  className="absolute right-2 top-2.5 rounded-md p-1.5 text-muted-foreground opacity-0 transition-opacity hover:bg-background hover:text-red-500 group-hover:opacity-100"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })}
      </div>
    </div>
  );
}
