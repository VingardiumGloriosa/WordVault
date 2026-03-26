export function getSessionMessage(pct: number): { title: string; subtitle: string } {
  if (pct === 100)
    return { title: "Perfect Recall", subtitle: "A scholar\u2019s performance." };
  if (pct >= 80)
    return { title: "Solid Session", subtitle: "Your lexicon grows stronger." };
  if (pct >= 50)
    return { title: "Making Progress", subtitle: "Repetition breeds mastery." };
  return { title: "Keep At It", subtitle: "Every review sharpens the mind." };
}
