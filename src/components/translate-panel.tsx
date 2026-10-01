"use client";

import { useState } from "react";
import {
  Check,
  Copy,
  Languages,
  Loader2,
  Sparkles,
  Trash2,
} from "lucide-react";
import { LANGUAGES } from "@/lib/languages";

interface TranslatePanelProps {
  sourceText: string;
}

interface TranslationResult {
  translation: string;
  model?: string;
}

export function TranslatePanel({ sourceText }: TranslatePanelProps) {
  const [target, setTarget] = useState("zh");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TranslationResult | null>(null);
  const [copied, setCopied] = useState(false);

  const canTranslate = sourceText.trim().length > 0 && !loading;

  async function handleTranslate() {
    if (!canTranslate) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: sourceText, targetLanguage: target }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Translation failed.");
      }
      setResult(data);
    } catch (err) {
      setResult(null);
      setError(err instanceof Error ? err.message : "Translation failed.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    if (!result?.translation) return;
    try {
      await navigator.clipboard.writeText(result.translation);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable — ignore
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <Sparkles className="h-4 w-4 text-primary" />
        <h2 className="text-sm font-semibold">AI Translate</h2>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        <div className="space-y-1.5">
          <label
            htmlFor="target-language"
            className="text-xs font-medium text-muted-foreground"
          >
            Translate to
          </label>
          <select
            id="target-language"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={handleTranslate}
          disabled={!canTranslate}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Languages className="h-4 w-4" />
          )}
          {loading ? "Translating…" : "Translate note"}
        </button>

        {!sourceText.trim() && (
          <p className="text-xs text-muted-foreground">
            Write something in the note editor first — the whole note will be
            translated.
          </p>
        )}

        {error && (
          <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {result && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground">
                {LANGUAGES.find((l) => l.code === target)?.name ?? target}
              </p>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  {copied ? "Copied" : "Copy"}
                </button>
                <button
                  type="button"
                  onClick={() => setResult(null)}
                  aria-label="Clear translation"
                  className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <div className="max-h-80 overflow-y-auto whitespace-pre-wrap rounded-lg border border-border bg-card px-3 py-2.5 text-sm leading-6 text-foreground">
              {result.translation}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
