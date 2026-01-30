import { View, Alert, StyleSheet } from "react-native";
import { Input, Text, Button } from "@rneui/themed";
import { useDictionaryStore } from "../store/dictionaryStore";
import { useAuth } from "../auth/AuthProvider";

export default function SearchScreen() {
  const { search, result, loading, error, saveCurrentWord } =
    useDictionaryStore();
  const { session } = useAuth();

  const entry = result?.[0];

  const handleSave = async () => {
    if (!session || !entry) return;
    try {
      await saveCurrentWord(entry, session.user.id);
      Alert.alert("Saved", `"${entry.word}" added to your saved words.`);
    } catch (err) {
      if (err instanceof Error) {
        Alert.alert("Save Failed", err.message);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Input
        placeholder="Search a word…"
        onSubmitEditing={(e) => search(e.nativeEvent.text)}
        returnKeyType="search"
      />

      {loading && <Text>Looking it up…</Text>}

      {error && <Text style={styles.error}>{error}</Text>}

      {entry && (
        <>
          <Text h3 style={styles.word}>
            {entry.word}
          </Text>

          {entry.meanings.map((meaning, i) => (
            <View key={i} style={styles.meaning}>
              <Text style={styles.partOfSpeech}>{meaning.partOfSpeech}</Text>

              {meaning.definitions.map((def, j) => (
                <Text key={j}>• {def.definition}</Text>
              ))}
            </View>
          ))}

          <Button
            title="Save"
            onPress={handleSave}
            containerStyle={styles.saveButton}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 16,
  },
  error: {
    color: "red",
  },
  word: {
    marginTop: 12,
  },
  meaning: {
    marginTop: 120,
  },
  partOfSpeech: {
    fontWeight: "bold",
  },
  saveButton: {
    marginTop: 20,
  },
});
