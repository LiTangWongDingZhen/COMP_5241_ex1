import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { languageName } from "@/lib/languages";

const MAX_INPUT_CHARS = 12000;

/**
 * POST /api/translate
 * Body: { text: string, targetLanguage: string }
 * Uses the OpenRouter chat completions API (OpenAI-compatible, server-side, key never exposed).
 */
export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENROUTER_API_KEY is not configured on the server." },
      { status: 500 }
    );
  }

  let body: { text?: unknown; targetLanguage?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const text = typeof body.text === "string" ? body.text.trim() : "";
  const targetLanguage =
    typeof body.targetLanguage === "string" ? body.targetLanguage : "";

  if (!text) {
    return NextResponse.json(
      { error: "Provide non-empty text to translate." },
      { status: 400 }
    );
  }
  if (text.length > MAX_INPUT_CHARS) {
    return NextResponse.json(
      { error: `Text is too long (max ${MAX_INPUT_CHARS} characters).` },
      { status: 400 }
    );
  }
  if (!targetLanguage) {
    return NextResponse.json(
      { error: "Provide a target language code." },
      { status: 400 }
    );
  }

  const openai = new OpenAI({
    apiKey,
    baseURL: "https://openrouter.ai/api/v1",
    defaultHeaders: {
      "HTTP-Referer": "http://localhost:3000",
      "X-Title": "Notely",
    },
  });
  const model = process.env.OPENROUTER_MODEL ?? "openai/gpt-4o-mini";

  try {
    const completion = await openai.chat.completions.create({
      model,
      temperature: 0.3,
      messages: [
        {
          role: "system",
          content:
            "You are a professional translator. Translate the user's text into the requested target language. " +
            "Preserve the original meaning, tone, line breaks, and formatting (lists, code, markdown). " +
            "Respond with ONLY the translated text — no explanations, no quotes, no markdown, no code fences.",
        },
        {
          role: "user",
          content: `Target language: ${languageName(targetLanguage)} (${targetLanguage})\n\nText:\n${text}`,
        },
      ],
    });

    const translation = (completion.choices[0]?.message?.content ?? "").trim();

    return NextResponse.json({
      translation,
      model,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Translation request failed.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
