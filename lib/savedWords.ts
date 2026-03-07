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
    tag: tag ? tag.toLowerCase() : tag,
  });

  if (error) throw error;
}

export async function checkIfSaved(word: string, userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("saved_words")
    .select("id")
    .eq("user_id", userId)
    .ilike("word", word)
    .limit(1);

  if (error) return false;
  return (data?.length ?? 0) > 0;
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
    .update({ tag: tag ? tag.toLowerCase() : null })
    .eq("id", id);
  if (error) throw error;
}

export async function fetchUserTags(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from("saved_words")
    .select("tag")
    .eq("user_id", userId)
    .not("tag", "is", null);

  if (error) throw error;

  const seen = new Set<string>();
  const tags: string[] = [];
  for (const row of data ?? []) {
    const key = (row.tag as string).toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      tags.push(key);
    }
  }
  return tags;
}

export async function deleteTag(userId: string, tag: string): Promise<void> {
  const { error } = await supabase
    .from("saved_words")
    .update({ tag: null })
    .eq("user_id", userId)
    .ilike("tag", tag);

  if (error) throw error;
}

export async function deleteSavedWord(id: string) {
  const { error } = await supabase.from("saved_words").delete().eq("id", id);

  if (error) throw error;
}
