import { supabase } from "./supabase";

export async function saveWord({
  userId,
  word,
  phonetic,
  definition,
  partOfSpeech,
  tag,
}: {
  userId: string;
  word: string;
  phonetic?: string;
  definition: string;
  partOfSpeech?: string;
  tag?: string;
}) {
  const { data: existing, error: checkError } = await supabase
    .from("saved_words")
    .select("id")
    .eq("user_id", userId)
    .ilike("word", word)
    .limit(1);

  if (checkError) throw checkError;

  if (existing && existing.length > 0) {
    throw new Error("This word is already in your collection");
  }

  const { error } = await supabase.from("saved_words").insert({
    user_id: userId,
    word,
    phonetic,
    definition,
    part_of_speech: partOfSpeech,
    tag,
  });

  if (error) throw error;
}

export async function fetchSavedWords(userId: string) {
  const { data, error } = await supabase
    .from("saved_words")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function updateWordTag(id: string, tag: string | null) {
  const { error } = await supabase
    .from("saved_words")
    .update({ tag: tag || null })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteSavedWord(id: string) {
  const { error } = await supabase.from("saved_words").delete().eq("id", id);

  if (error) throw error;
}
