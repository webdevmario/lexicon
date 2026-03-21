import { useQuery } from "@tanstack/react-query";
import { fetchWord } from "@/lib/api";
import type { WordEntry } from "@/types";

/**
 * Fetches and caches a word's definition data.
 * Cache persists for the session — avoids re-fetching the same word.
 */
export function useWordLookup(word: string | undefined) {
  return useQuery<WordEntry[], Error>({
    queryKey: ["word", word?.toLowerCase()],
    queryFn: () => fetchWord(word!),
    enabled: !!word && word.trim().length > 0,
    staleTime: Infinity,
    retry: 1,
  });
}
