export interface Note {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export type NoteInput = Pick<Note, "title" | "content">;

export interface TranslateRequest {
  text: string;
  targetLanguage: string;
}

export interface TranslateResponse {
  translation: string;
  detectedLanguage?: string;
  model?: string;
}
