import AsyncStorage from "@react-native-async-storage/async-storage";

const RANDOM_WORD_API = "https://random-word-api.herokuapp.com/word";
const DICTIONARY_API = process.env.EXPO_PUBLIC_DICTIONARY_API_URL;
const STORAGE_KEY = "wotd";
const MAX_RETRIES = 5;

type CachedWotd = {
  word: string;
  date: string;
};

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function getWordOfTheDay(): Promise<string> {
  const today = todayKey();

  // Check cache first
  try {
    const cached = await AsyncStorage.getItem(STORAGE_KEY);
    if (cached) {
      const parsed: CachedWotd = JSON.parse(cached);
      if (parsed.date === today && parsed.word) return parsed.word;
    }
  } catch {}

  // Fetch a random word that exists in the dictionary
  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      const randomRes = await fetch(RANDOM_WORD_API);
      if (!randomRes.ok) continue;
      const [word]: string[] = await randomRes.json();
      if (!word || word.length < 3) continue;

      // Validate it has a dictionary entry
      const dictRes = await fetch(`${DICTIONARY_API}/${encodeURIComponent(word)}`);
      if (!dictRes.ok) continue;

      // Cache for the day
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ word, date: today }));
      return word;
    } catch {
      continue;
    }
  }

  // Fallback if API fails
  return "serendipity";
}
