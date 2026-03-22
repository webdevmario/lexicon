import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface WordList {
  id: string;
  name: string;
  words: string[];
  createdAt: number;
  isDefault?: boolean;
}

const DEFAULT_LISTS: WordList[] = [
  {
    id: "liked-words",
    name: "Liked Words",
    words: [],
    createdAt: 0,
    isDefault: true,
  },
  {
    id: "favorites",
    name: "Favorites",
    words: [],
    createdAt: 0,
    isDefault: true,
  },
  {
    id: "interesting-words",
    name: "Interesting Words",
    words: [],
    createdAt: 0,
    isDefault: true,
  },
];

interface ListStore {
  lists: WordList[];

  createList: (name: string) => void;
  deleteList: (id: string) => void;
  renameList: (id: string, name: string) => void;
  addWordToList: (listId: string, word: string) => void;
  removeWordFromList: (listId: string, word: string) => void;
  getListsForWord: (word: string) => WordList[];
}

export const useListStore = create<ListStore>()(
  persist(
    (set, get) => ({
      lists: DEFAULT_LISTS,

      createList: (name: string) => {
        const id = `list-${Date.now()}`;
        set((state) => ({
          lists: [
            ...state.lists,
            { id, name, words: [], createdAt: Date.now() },
          ],
        }));
      },

      deleteList: (id: string) => {
        set((state) => ({
          lists: state.lists.filter((l) => l.id !== id),
        }));
      },

      renameList: (id: string, name: string) => {
        set((state) => ({
          lists: state.lists.map((l) => (l.id === id ? { ...l, name } : l)),
        }));
      },

      addWordToList: (listId: string, word: string) => {
        const lower = word.toLowerCase();
        set((state) => ({
          lists: state.lists.map((l) =>
            l.id === listId && !l.words.includes(lower)
              ? { ...l, words: [...l.words, lower] }
              : l,
          ),
        }));
      },

      removeWordFromList: (listId: string, word: string) => {
        const lower = word.toLowerCase();
        set((state) => ({
          lists: state.lists.map((l) =>
            l.id === listId
              ? { ...l, words: l.words.filter((w) => w !== lower) }
              : l,
          ),
        }));
      },

      getListsForWord: (word: string) => {
        const lower = word.toLowerCase();
        return get().lists.filter((l) => l.words.includes(lower));
      },
    }),
    {
      name: "lexicon-lists",
    },
  ),
);
