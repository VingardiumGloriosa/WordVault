import { View } from "react-native";
import { Input, Text, Button } from "@rneui/themed";
import { useDictionaryStore } from "../store/dictionaryStore";
import { useAuth } from "../auth/AuthProvider";

export default function SearchScreen() {
  const { search, result, loading, error, saveCurrentWord } =
    useDictionaryStore();
  const { session } = useAuth();

  const entry = result?.[0];

  return (
    <View style={{ padding: 16 }}>
      <Input
        placeholder="Search a word…"
        onSubmitEditing={(e) => search(e.nativeEvent.text)}
        returnKeyType="search"
      />

      {loading && <Text>Looking it up… 🔍</Text>}

      {error && <Text style={{ color: "red" }}>{error}</Text>}

      {entry && (
        <>
          <Text h3 style={{ marginTop: 12 }}>
            {entry.word}
          </Text>

          {entry.meanings.map((meaning, i) => (
            <View key={i} style={{ marginTop: 12 }}>
              <Text style={{ fontWeight: "bold" }}>{meaning.partOfSpeech}</Text>

              {meaning.definitions.map((def, j) => (
                <Text key={j}>• {def.definition}</Text>
              ))}
            </View>
          ))}

          <Button
            title="Save ⭐"
            onPress={() => {
              if (!session) return;
              saveCurrentWord(entry, session.user.id);
            }}
            containerStyle={{ marginTop: 20 }}
          />
        </>
      )}
    </View>
  );
}
