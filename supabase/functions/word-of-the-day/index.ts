import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RANDOM_API = "https://random-word-api.herokuapp.com/word?number=10";
const DICTIONARY_API = "https://api.dictionaryapi.dev/api/v2/entries/en";

Deno.serve(async () => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // Check if today already has a word
  const today = new Date().toISOString().slice(0, 10);
  const { data: existing } = await supabase
    .from("word_of_the_day")
    .select("word")
    .eq("date", today)
    .single();

  if (existing) {
    return new Response(JSON.stringify({ word: existing.word, cached: true }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  // Fetch random words and find one with a dictionary entry
  let selectedWord = "serendipity"; // fallback

  try {
    const res = await fetch(RANDOM_API);
    if (res.ok) {
      const words: string[] = await res.json();

      for (const word of words) {
        if (word.length < 3) continue;
        const dictRes = await fetch(`${DICTIONARY_API}/${encodeURIComponent(word)}`);
        if (dictRes.ok) {
          selectedWord = word;
          break;
        }
      }
    }
  } catch {
    // Use fallback
  }

  // Store in database
  const { error } = await supabase
    .from("word_of_the_day")
    .insert({ word: selectedWord, date: today });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ word: selectedWord, cached: false }), {
    headers: { "Content-Type": "application/json" },
  });
});
