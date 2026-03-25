-- Atomic update for word_progress to avoid read-then-write race conditions.
-- Run this in your Supabase SQL Editor.

CREATE OR REPLACE FUNCTION update_word_progress(
  p_user_id UUID,
  p_saved_word_id UUID,
  p_easiness_factor DOUBLE PRECISION,
  p_interval INTEGER,
  p_repetitions INTEGER,
  p_next_review_at TIMESTAMPTZ,
  p_correct BOOLEAN
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE word_progress
  SET
    easiness_factor = p_easiness_factor,
    interval = p_interval,
    repetitions = p_repetitions,
    next_review_at = p_next_review_at,
    last_reviewed_at = NOW(),
    times_correct = times_correct + CASE WHEN p_correct THEN 1 ELSE 0 END,
    times_incorrect = times_incorrect + CASE WHEN p_correct THEN 0 ELSE 1 END
  WHERE user_id = p_user_id
    AND saved_word_id = p_saved_word_id;
END;
$$;
