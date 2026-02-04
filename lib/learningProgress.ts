import { supabase } from "./supabase";
import { ReviewResult } from "./spacedRepetition";

export type WordProgress = {
  id: string;
  user_id: string;
  saved_word_id: string;
  easiness_factor: number;
  interval: number;
  repetitions: number;
  next_review_at: string;
  last_reviewed_at: string | null;
  times_correct: number;
  times_incorrect: number;
  created_at: string;
};

export type SavedWordWithProgress = {
  id: string;
  word: string;
  phonetic?: string;
  definition: string;
  part_of_speech: string;
  progress: WordProgress | null;
};

export async function fetchWordsWithProgress(
  userId: string,
): Promise<SavedWordWithProgress[]> {
  const { data: savedWords, error: swErr } = await supabase
    .from("saved_words")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (swErr) throw swErr;
  if (!savedWords || savedWords.length === 0) return [];

  const { data: progressRows, error: pErr } = await supabase
    .from("word_progress")
    .select("*")
    .eq("user_id", userId);

  if (pErr) throw pErr;

  const progressMap = new Map<string, WordProgress>();
  for (const p of progressRows || []) {
    progressMap.set(p.saved_word_id, p);
  }

  return savedWords.map((sw) => ({
    id: sw.id,
    word: sw.word,
    phonetic: sw.phonetic,
    definition: sw.definition,
    part_of_speech: sw.part_of_speech,
    progress: progressMap.get(sw.id) || null,
  }));
}

export async function ensureProgressRows(
  userId: string,
  savedWordIds: string[],
): Promise<void> {
  const { data: existing, error: fetchErr } = await supabase
    .from("word_progress")
    .select("saved_word_id")
    .eq("user_id", userId)
    .in("saved_word_id", savedWordIds);

  if (fetchErr) throw fetchErr;

  const existingSet = new Set((existing || []).map((r) => r.saved_word_id));
  const missing = savedWordIds.filter((id) => !existingSet.has(id));

  if (missing.length === 0) return;

  const rows = missing.map((swId) => ({
    user_id: userId,
    saved_word_id: swId,
  }));

  const { error: insertErr } = await supabase
    .from("word_progress")
    .insert(rows);

  if (insertErr) throw insertErr;
}

export async function updateWordProgress(
  userId: string,
  savedWordId: string,
  result: ReviewResult,
  correct: boolean,
): Promise<void> {
  const updateField = correct
    ? "times_correct"
    : "times_incorrect";

  // First get current value for increment
  const { data: current, error: fetchErr } = await supabase
    .from("word_progress")
    .select(updateField)
    .eq("user_id", userId)
    .eq("saved_word_id", savedWordId)
    .single();

  if (fetchErr) throw fetchErr;

  const { error } = await supabase
    .from("word_progress")
    .update({
      easiness_factor: result.easinessFactor,
      interval: result.interval,
      repetitions: result.repetitions,
      next_review_at: result.nextReviewAt.toISOString(),
      last_reviewed_at: new Date().toISOString(),
      [updateField]: (current?.[updateField] ?? 0) + 1,
    })
    .eq("user_id", userId)
    .eq("saved_word_id", savedWordId);

  if (error) throw error;
}

export async function saveLearningSession(
  userId: string,
  sessionType: "flashcard" | "quiz" | "match",
  wordsStudied: number,
  wordsCorrect: number,
  durationSeconds?: number,
): Promise<void> {
  const { error } = await supabase.from("learning_sessions").insert({
    user_id: userId,
    session_type: sessionType,
    words_studied: wordsStudied,
    words_correct: wordsCorrect,
    duration_seconds: durationSeconds,
  });

  if (error) throw error;
}

export async function fetchLearningStats(userId: string) {
  // Words mastered (repetitions >= 3 means well-learned)
  const { count: masteredCount, error: mErr } = await supabase
    .from("word_progress")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("repetitions", 3);

  if (mErr) throw mErr;

  // Words due for review
  const { count: dueCount, error: dErr } = await supabase
    .from("word_progress")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .lte("next_review_at", new Date().toISOString());

  if (dErr) throw dErr;

  // Streak: count consecutive days with at least one session
  const { data: sessions, error: sErr } = await supabase
    .from("learning_sessions")
    .select("completed_at")
    .eq("user_id", userId)
    .order("completed_at", { ascending: false })
    .limit(60);

  if (sErr) throw sErr;

  let streak = 0;
  if (sessions && sessions.length > 0) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sessionDays = new Set<string>();
    for (const s of sessions) {
      const d = new Date(s.completed_at);
      d.setHours(0, 0, 0, 0);
      sessionDays.add(d.toISOString());
    }

    const check = new Date(today);
    // Allow today or yesterday as starting point
    if (!sessionDays.has(check.toISOString())) {
      check.setDate(check.getDate() - 1);
    }

    while (sessionDays.has(check.toISOString())) {
      streak++;
      check.setDate(check.getDate() - 1);
    }
  }

  return {
    streak,
    mastered: masteredCount ?? 0,
    due: dueCount ?? 0,
  };
}
