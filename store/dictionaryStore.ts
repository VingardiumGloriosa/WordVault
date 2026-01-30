import { create } from "zustand";
import { saveWord } from "../lib/savedWords";

const API_URL = "https://api.dictionaryapi.dev/api/v2/entries/en";

export type DictionaryEntry = {
  word: string;
  phonetic?: string;
  meanings: {
    partOfSpeech: string;
    definitions: {
      definition: string;
      example?: string;
    }[];
  }[];
};

type DictionaryState = {
  query: string;
  result: DictionaryEntry[] | null;
  loading: boolean;
  error: string | null;

  search: (word: string) => Promise<void>;
  clear: () => void;
  saveCurrentWord: (entry: DictionaryEntry, userId: string) => Promise<void>;
};

export const useDictionaryStore = create<DictionaryState>((set) => ({
  query: "",
  result: null,
  loading: false,
  error: null,

  search: async (word) => {
    if (!word.trim()) return;

    set({ loading: true, error: null, query: word });

    try {
      const res = await fetch(`${API_URL}/${word.toLowerCase()}`);

      if (!res.ok) {
        throw new Error("Word not found");
      }

      const data = await res.json();

      set({ result: data, loading: false });
    } catch (err: any) {
      set({
        error: err.message ?? "Something went wrong",
        result: null,
        loading: false,
      });
    }
  },

  clear: () =>
    set({
      query: "",
      result: null,
      error: null,
      loading: false,
    }),

  saveCurrentWord: async (entry, userId) => {
    const meaning = entry.meanings[0];
    const definition = meaning.definitions[0];

    await saveWord({
      userId,
      word: entry.word,
      phonetic: entry.phonetic,
      definition: definition.definition,
      partOfSpeech: meaning.partOfSpeech,
    });
  },
}));
