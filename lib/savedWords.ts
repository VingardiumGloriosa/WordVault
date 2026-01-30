import { supabase } from "./supabase";

export async function saveWord({
  userId,
  word,
  phonetic,
  definition,
  partOfSpeech,
}: {
  userId: string;
  word: string;
  phonetic?: string;
  definition: string;
  partOfSpeech?: string;
}) {
  const { error } = await supabase.from("saved_words").insert({
    user_id: userId,
    word,
    phonetic,
    definition,
    part_of_speech: partOfSpeech,
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

export async function deleteSavedWord(id: string) {
  const { error } = await supabase.from("saved_words").delete().eq("id", id);

  if (error) throw error;
}
