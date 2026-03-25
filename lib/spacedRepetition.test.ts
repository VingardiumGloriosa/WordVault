import { reviewCard, CardState } from "./spacedRepetition";

const baseCard: CardState = {
  easinessFactor: 2.5,
  interval: 0,
  repetitions: 0,
};

describe("reviewCard", () => {
  it("sets interval to 1 day on first correct answer", () => {
    const result = reviewCard(baseCard, 5);
    expect(result.repetitions).toBe(1);
    expect(result.interval).toBe(1);
  });

  it("sets interval to 6 days on second correct answer", () => {
    const after1 = reviewCard(baseCard, 5);
    const result = reviewCard(after1, 5);
    expect(result.repetitions).toBe(2);
    expect(result.interval).toBe(6);
  });

  it("multiplies interval by easiness factor on third+ correct answer", () => {
    let card = reviewCard(baseCard, 5);
    card = reviewCard(card, 5);
    const result = reviewCard(card, 5);
    expect(result.repetitions).toBe(3);
    expect(result.interval).toBe(Math.round(6 * card.easinessFactor));
  });

  it("resets repetitions and interval on incorrect answer", () => {
    const good = reviewCard(baseCard, 5);
    const result = reviewCard(good, 1);
    expect(result.repetitions).toBe(0);
    expect(result.interval).toBe(1);
  });

  it("never drops easiness factor below 1.3", () => {
    let card: CardState = { ...baseCard, easinessFactor: 1.3 };
    const result = reviewCard(card, 0);
    expect(result.easinessFactor).toBe(1.3);
  });

  it("increases easiness factor on perfect recall", () => {
    const result = reviewCard(baseCard, 5);
    expect(result.easinessFactor).toBeGreaterThan(baseCard.easinessFactor);
  });

  it("decreases easiness factor on poor recall", () => {
    const result = reviewCard(baseCard, 2);
    expect(result.easinessFactor).toBeLessThan(baseCard.easinessFactor);
  });

  it("returns a nextReviewAt date in the future", () => {
    const result = reviewCard(baseCard, 4);
    expect(result.nextReviewAt.getTime()).toBeGreaterThan(Date.now());
  });

  it("treats quality 3 as correct (boundary)", () => {
    const result = reviewCard(baseCard, 3);
    expect(result.repetitions).toBe(1);
  });

  it("treats quality 2 as incorrect (boundary)", () => {
    const result = reviewCard(baseCard, 2);
    expect(result.repetitions).toBe(0);
  });
});
