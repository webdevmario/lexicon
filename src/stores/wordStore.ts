import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { MasteryLevel, QuizAttempt, SavedWord } from "@/types";

interface WordStore {
  /** All saved words keyed by word string for fast lookup */
  words: Record<string, SavedWord>;

  /** Ordered list of word strings (most recent first) */
  order: string[];

  /** Save/heart a word */
  saveWord: (word: string) => void;

  /** Remove a word from saved */
  removeWord: (word: string) => void;

  /** Check if a word is saved */
  isSaved: (word: string) => boolean;

  /** Update mastery level */
  setMastery: (word: string, level: MasteryLevel) => void;

  /** Add a note to a word */
  setNote: (word: string, note: string) => void;

  /** Record a quiz attempt */
  addQuizAttempt: (word: string, attempt: QuizAttempt) => void;

  /** Get all saved words as an array (ordered) */
  getSavedWords: () => SavedWord[];

  /** Total count */
  count: () => number;

  /** Export all data as a portable JSON string */
  exportData: () => string;

  /** Import data from a JSON string (merges with existing, doesn't overwrite) */
  importData: (json: string) => { added: number; skipped: number };
}

export const useWordStore = create<WordStore>()(
  persist(
    (set, get) => ({
      words: {},
      order: [],

      saveWord: (word: string) => {
        const lower = word.toLowerCase();
        if (get().words[lower]) return;

        const entry: SavedWord = {
          id: `${lower}-${Date.now()}`,
          word: lower,
          savedAt: Date.now(),
          mastery: "new",
          quizHistory: [],
        };

        set((state) => ({
          words: { ...state.words, [lower]: entry },
          order: [lower, ...state.order],
        }));
      },

      removeWord: (word: string) => {
        const lower = word.toLowerCase();
        set((state) => {
          const { [lower]: _, ...rest } = state.words;
          return {
            words: rest,
            order: state.order.filter((w) => w !== lower),
          };
        });
      },

      isSaved: (word: string) => !!get().words[word.toLowerCase()],

      setMastery: (word: string, level: MasteryLevel) => {
        const lower = word.toLowerCase();
        set((state) => {
          const existing = state.words[lower];
          if (!existing) return state;
          return {
            words: {
              ...state.words,
              [lower]: { ...existing, mastery: level },
            },
          };
        });
      },

      setNote: (word: string, note: string) => {
        const lower = word.toLowerCase();
        set((state) => {
          const existing = state.words[lower];
          if (!existing) return state;
          return {
            words: {
              ...state.words,
              [lower]: { ...existing, note },
            },
          };
        });
      },

      addQuizAttempt: (word: string, attempt: QuizAttempt) => {
        const lower = word.toLowerCase();
        set((state) => {
          const existing = state.words[lower];
          if (!existing) return state;

          const history = [...existing.quizHistory, attempt];

          // Auto-update mastery based on recent performance
          const recent = history.slice(-5);
          const correctRate = recent.filter((a) => a.correct).length / recent.length;

          let mastery: MasteryLevel = existing.mastery;
          if (history.length >= 3 && correctRate >= 0.8) mastery = "mastered";
          else if (history.length >= 2 && correctRate >= 0.6) mastery = "familiar";
          else if (history.length >= 1) mastery = "learning";

          return {
            words: {
              ...state.words,
              [lower]: { ...existing, quizHistory: history, mastery },
            },
          };
        });
      },

      getSavedWords: () => {
        const state = get();
        return state.order.map((w) => state.words[w]).filter((w): w is SavedWord => !!w);
      },

      count: () => get().order.length,

      exportData: () => {
        const state = get();
        const exportPayload = {
          version: 1,
          exportedAt: new Date().toISOString(),
          words: state.order
            .map((w) => state.words[w])
            .filter((w): w is SavedWord => !!w),
        };
        return JSON.stringify(exportPayload, null, 2);
      },

      importData: (json: string) => {
        const parsed = JSON.parse(json);

        // Support both formats: { words: [...] } and raw array
        const incoming: SavedWord[] = Array.isArray(parsed)
          ? parsed
          : (parsed?.words ?? []);

        if (!Array.isArray(incoming)) {
          throw new Error("Invalid import format.");
        }

        let added = 0;
        let skipped = 0;

        const currentWords = get().words;
        const newWords = { ...currentWords };
        const newOrder = [...get().order];

        for (const entry of incoming) {
          const word = entry?.word?.toLowerCase();
          if (!word || typeof word !== "string") {
            skipped++;
            continue;
          }

          if (newWords[word]) {
            skipped++;
            continue;
          }

          newWords[word] = {
            id: entry.id ?? `${word}-${Date.now()}`,
            word,
            savedAt: entry.savedAt ?? Date.now(),
            note: entry.note,
            mastery: entry.mastery ?? "new",
            quizHistory: entry.quizHistory ?? [],
          };
          newOrder.unshift(word);
          added++;
        }

        set({ words: newWords, order: newOrder });
        return { added, skipped };
      },
    }),
    {
      name: "lexicon-words",
    },
  ),
);
