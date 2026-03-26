import { supabase } from "./supabase";

const FALLBACKS = [
  "ephemeral", "petrichor", "mellifluous", "serendipity", "ineffable",
  "catharsis", "chiaroscuro", "incandescent", "quintessence", "wanderlust",
  "iridescent", "paradox", "whimsical", "epiphany", "mercurial",
  "gossamer", "reverie", "ethereal", "enigma", "halcyon",
  "ebullient", "penumbra", "sanguine", "laconic", "wistful",
  "silhouette", "zenith", "dulcet", "liminal", "ennui",
];

function fallbackWord(): string {
  const dayIndex = Math.floor(Date.now() / 86400000);
  return FALLBACKS[dayIndex % FALLBACKS.length];
}

export async function getWordOfTheDay(): Promise<string> {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const { data } = await supabase
      .from("word_of_the_day")
      .select("word")
      .eq("date", today)
      .single();

    if (data?.word) return data.word;
  } catch {}

  return fallbackWord();
}
