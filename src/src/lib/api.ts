import type { WordEntry } from "@/types";

const API_BASE = "https://api.dictionaryapi.dev/api/v2/entries/en";

/**
 * Fetches word data from the Free Dictionary API.
 * Returns an array of entries (a word can have multiple entries).
 */
export async function fetchWord(word: string): Promise<WordEntry[]> {
  const trimmed = word.trim().toLowerCase();
  if (!trimmed) throw new Error("Please enter a word to look up.");

  const response = await fetch(`${API_BASE}/${encodeURIComponent(trimmed)}`);

  if (response.status === 404) {
    throw new Error(`No definitions found for "${trimmed}".`);
  }

  if (!response.ok) {
    throw new Error("Something went wrong. Please try again.");
  }

  return response.json();
}

/**
 * Gets the first available audio URL from a word's phonetics.
 */
export function getAudioUrl(entry: WordEntry): string | undefined {
  return entry.phonetics.find((p) => p.audio && p.audio.length > 0)?.audio;
}

/**
 * Gets the best phonetic text available.
 */
export function getPhoneticText(entry: WordEntry): string | undefined {
  return entry.phonetics.find((p) => p.text && p.text.length > 0)?.text ?? undefined;
}
