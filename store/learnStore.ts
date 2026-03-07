import { create } from "zustand";
import {
  fetchWordsWithProgress,
  ensureProgressRows,
  fetchLearningStats,
  SavedWordWithProgress,
} from "../lib/learningProgress";
import { supabase } from "../lib/supabase";

type LearnState = {
  words: SavedWordWithProgress[];
  stats: { streak: number; mastered: number; due: number };
  loading: boolean;
  error: string | null;
  selectedTag: string | null;
  availableTags: string[];

  loadWords: (userId: string, tag?: string | null) => Promise<void>;
  loadStats: (userId: string, tag?: string | null) => Promise<void>;
  loadTags: (userId: string) => Promise<void>;
  setSelectedTag: (tag: string | null) => void;
};

export const useLearnStore = create<LearnState>((set, get) => ({
  words: [],
  stats: { streak: 0, mastered: 0, due: 0 },
  loading: false,
  error: null,
  selectedTag: null,
  availableTags: [],

  loadWords: async (userId, tag) => {
    set({ loading: true, error: null });
    try {
      const words = await fetchWordsWithProgress(userId, tag);

      // Lazy-init progress rows for words that don't have them
      const missingIds = words
        .filter((w) => !w.progress)
        .map((w) => w.id);
      if (missingIds.length > 0) {
        await ensureProgressRows(userId, missingIds);
        // Re-fetch to get the new progress rows
        const updated = await fetchWordsWithProgress(userId, tag);
        set({ words: updated, loading: false });
      } else {
        set({ words, loading: false });
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load words";
      set({ error: message, loading: false });
    }
  },

  loadStats: async (userId, tag) => {
    try {
      const stats = await fetchLearningStats(userId, tag);
      set({ stats });
    } catch {
      // Stats are non-critical, fail silently
    }
  },

  loadTags: async (userId) => {
    try {
      const { data, error } = await supabase
        .from("saved_words")
        .select("tag")
        .eq("user_id", userId)
        .not("tag", "is", null);

      if (error) throw error;

      const tags = [...new Set((data || []).map((r) => r.tag as string))];
      set({ availableTags: tags });
    } catch {
      // Non-critical
    }
  },

  setSelectedTag: (tag) => {
    set({ selectedTag: tag });
  },
}));
