import { create } from "zustand";
import {
  fetchWordsWithProgress,
  ensureProgressRows,
  fetchLearningStats,
  SavedWordWithProgress,
} from "../lib/learningProgress";

type LearnState = {
  words: SavedWordWithProgress[];
  stats: { streak: number; mastered: number; due: number };
  loading: boolean;
  error: string | null;

  loadWords: (userId: string) => Promise<void>;
  loadStats: (userId: string) => Promise<void>;
};

export const useLearnStore = create<LearnState>((set) => ({
  words: [],
  stats: { streak: 0, mastered: 0, due: 0 },
  loading: false,
  error: null,

  loadWords: async (userId) => {
    set({ loading: true, error: null });
    try {
      const words = await fetchWordsWithProgress(userId);

      // Lazy-init progress rows for words that don't have them
      const missingIds = words
        .filter((w) => !w.progress)
        .map((w) => w.id);
      if (missingIds.length > 0) {
        await ensureProgressRows(userId, missingIds);
        // Re-fetch to get the new progress rows
        const updated = await fetchWordsWithProgress(userId);
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

  loadStats: async (userId) => {
    try {
      const stats = await fetchLearningStats(userId);
      set({ stats });
    } catch {
      // Stats are non-critical, fail silently
    }
  },
}));
