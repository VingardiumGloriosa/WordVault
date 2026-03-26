import AsyncStorage from "@react-native-async-storage/async-storage";

const DICTIONARY_API = process.env.EXPO_PUBLIC_DICTIONARY_API_URL;
const STORAGE_KEY = "wotd";

const SEED_WORDS = [
  "ephemeral", "petrichor", "mellifluous", "serendipity", "ineffable",
  "sanguine", "laconic", "halcyon", "ebullient", "penumbra",
  "catharsis", "wistful", "chiaroscuro", "ennui", "incandescent",
  "quintessence", "wanderlust", "zenith", "iridescent", "paradox",
  "silhouette", "whimsical", "epiphany", "mercurial", "liminal",
  "gossamer", "reverie", "dulcet", "ethereal", "enigma",
];

type CachedWotd = { word: string; date: string };

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Returns a word instantly (sync from cache or seed list). */
export function getWordOfTheDay(): string {
  // Deterministic pick from seed list — always instant
  const dayIndex = Math.floor(Date.now() / 86400000);
  return SEED_WORDS[dayIndex % SEED_WORDS.length];
}

/** Tries to load a cached WOTD, falls back to seed list. Kicks off a background fetch for tomorrow. */
export async function getWordOfTheDayAsync(): Promise<string> {
  const today = todayKey();

  try {
    const cached = await AsyncStorage.getItem(STORAGE_KEY);
    if (cached) {
      const parsed: CachedWotd = JSON.parse(cached);
      if (parsed.date === today && parsed.word) return parsed.word;
    }
  } catch {}

  // Use seed word immediately, but try to fetch a real one in the background
  const seed = getWordOfTheDay();
  fetchAndCache(today).catch(() => {});
  return seed;
}

async function fetchAndCache(date: string): Promise<void> {
  // Pick a random word from a bigger pool via the dictionary API's suggestions
  const candidates = [
    "aplomb", "bucolic", "clandestine", "diaphanous", "effervescent",
    "fugacious", "harbinger", "idyllic", "juxtapose", "kaleidoscope",
    "loquacious", "maelstrom", "nascent", "opalescent", "phosphorescence",
    "quixotic", "resplendent", "scintillate", "tenebrous", "ubiquitous",
    "verdant", "vicissitude", "solace", "nocturne", "requiem",
    "tempest", "vignette", "aurora", "confluence", "denouement",
    "equanimity", "flourish", "rhapsody", "alchemy", "chrysalis",
    "brevity", "crescendo", "elixir", "gambit", "kismet",
  ];

  const dayIndex = Math.floor(Date.now() / 86400000);
  const word = candidates[dayIndex % candidates.length];

  try {
    const res = await fetch(`${DICTIONARY_API}/${encodeURIComponent(word)}`);
    if (res.ok) {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ word, date }));
    }
  } catch {}
}
