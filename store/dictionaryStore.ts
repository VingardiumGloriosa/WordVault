import { create } from "zustand";
import { saveWord } from "../lib/savedWords";

const API_URL = process.env.EXPO_PUBLIC_DICTIONARY_API_URL;

const searchCache = new Map<string, DictionaryEntry[]>();
const CACHE_MAX = 50;

export type DictionaryEntry = {
  word: string;
  phonetic?: string;
  phonetics?: { text?: string; audio?: string }[];
  meanings: {
    partOfSpeech: string;
    definitions: {
      definition: string;
      example?: string;
    }[];
  }[];
};

type DictionaryState = {
  result: DictionaryEntry[] | null;
  loading: boolean;
  error: string | null;
  recentSearches: string[];

  search: (word: string) => Promise<void>;
  saveCurrentWord: (entry: DictionaryEntry, userId: string, tag?: string) => Promise<void>;
  clearResult: () => void;
};

export function getCachedEntry(word: string): DictionaryEntry[] | undefined {
  return searchCache.get(word.trim().toLowerCase());
}

export const useDictionaryStore = create<DictionaryState>((set) => ({
  result: null,
  loading: false,
  error: null,
  recentSearches: [],

  search: async (word) => {
    if (!word.trim()) return;

    const key = word.trim().toLowerCase();
    const cached = searchCache.get(key);
    if (cached) {
      set((state) => ({
        result: cached,
        loading: false,
        error: null,
        recentSearches: [key, ...state.recentSearches.filter((w) => w !== key)].slice(0, 10),
      }));
      return;
    }

    set({ loading: true, error: null });

    try {
      const res = await fetch(`${API_URL}/${encodeURIComponent(key)}`);

      if (!res.ok) {
        throw new Error(
          res.status === 404
            ? "Word not found"
            : `Lookup failed (status ${res.status})`,
        );
      }

      const data = await res.json();

      if (searchCache.size >= CACHE_MAX) {
        const firstKey = searchCache.keys().next().value;
        if (firstKey !== undefined) searchCache.delete(firstKey);
      }
      searchCache.set(key, data);

      set((state) => ({
        result: data,
        loading: false,
        recentSearches: [key, ...state.recentSearches.filter((w) => w !== key)].slice(0, 10),
      }));
    } catch (err) {
      const message =
        err instanceof TypeError
          ? "Network error — check your connection"
          : err instanceof Error
            ? err.message
            : "Something went wrong";
      set({
        error: message,
        result: null,
        loading: false,
      });
    }
  },

  clearResult: () => set({ result: null, error: null }),

  saveCurrentWord: async (entry, userId, tag?) => {
    if (!entry.meanings || entry.meanings.length === 0) {
      throw new Error("No definitions available to save");
    }

    const MAX_LENGTH = 2000;
    const parts = entry.meanings.map((m) => {
      const defs = m.definitions
        .map((d, i) => `${i + 1}. ${d.definition}`)
        .join("; ");
      return `(${m.partOfSpeech}) ${defs}`;
    });
    let definition = parts.join(" | ");
    if (definition.length > MAX_LENGTH) {
      definition = definition.slice(0, MAX_LENGTH - 3) + "...";
    }

    await saveWord({
      userId,
      word: entry.word,
      phonetic: entry.phonetic,
      definition,
      partOfSpeech: entry.meanings[0].partOfSpeech,
      tag: tag?.trim() || undefined,
    });
  },
}));
