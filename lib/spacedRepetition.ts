// SM-2 Spaced Repetition Algorithm
// Pure function — no side effects or dependencies

export type CardState = {
  easinessFactor: number;
  interval: number;
  repetitions: number;
};

export type ReviewResult = CardState & {
  nextReviewAt: Date;
};

export function reviewCard(card: CardState, quality: number): ReviewResult {
  // quality: 0-5 (0 = complete blackout, 5 = perfect recall)
  let { easinessFactor, interval, repetitions } = card;

  if (quality >= 3) {
    // Correct response
    repetitions += 1;
    if (repetitions === 1) {
      interval = 1;
    } else if (repetitions === 2) {
      interval = 6;
    } else {
      interval = Math.round(interval * easinessFactor);
    }
  } else {
    // Incorrect — reset
    repetitions = 0;
    interval = 1;
  }

  // Adjust easiness factor (SM-2 formula)
  easinessFactor =
    easinessFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (easinessFactor < 1.3) easinessFactor = 1.3;

  const nextReviewAt = new Date();
  nextReviewAt.setDate(nextReviewAt.getDate() + interval);

  return { easinessFactor, interval, repetitions, nextReviewAt };
}
