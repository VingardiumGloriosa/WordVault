import { View, Alert, StyleSheet, ScrollView, SafeAreaView } from "react-native";
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
    <SafeAreaView style={styles.safeArea}>
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Input
        placeholder="search a word..."
        placeholderTextColor="#555"
        onSubmitEditing={(e) => search(e.nativeEvent.text)}
        returnKeyType="search"
        leftIcon={{ name: "search", type: "material", color: "#a855f7", size: 20 }}
        containerStyle={styles.searchContainer}
        inputStyle={styles.inputText}
        inputContainerStyle={styles.inputInner}
      />

      {loading && <Text style={styles.loadingText}>summoning definition...</Text>}

      {error && <Text style={styles.error}>{error}</Text>}

      {entry && (
        <View style={styles.resultCard}>
          <Text h3 style={styles.word}>{entry.word}</Text>
          {entry.phonetic && (
            <Text style={styles.phonetic}>{entry.phonetic}</Text>
          )}

          {entry.meanings.map((meaning, i) => (
            <View key={i} style={styles.meaning}>
              <Text style={styles.partOfSpeech}>{meaning.partOfSpeech}</Text>

              {meaning.definitions.map((def, j) => (
                <View key={j} style={styles.definitionItem}>
                  <Text style={styles.definitionText}>{def.definition}</Text>
                  {def.example && (
                    <Text style={styles.example}>"{def.example}"</Text>
                  )}
                </View>
              ))}
            </View>
          ))}

          <Button
            title="Save Word"
            onPress={handleSave}
            containerStyle={styles.saveButton}
            buttonStyle={styles.saveButtonInner}
            titleStyle={styles.saveButtonText}
          />
        </View>
      )}
    </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0a0a0a",
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingTop: 12,
  },
  searchContainer: {
    marginBottom: 8,
  },
  inputInner: {
    borderBottomColor: "#2a1545",
    borderBottomWidth: 1.5,
  },
  inputText: {
    color: "#d4d4d4",
  },
  loadingText: {
    textAlign: "center",
    color: "#7c3aed",
    marginTop: 16,
    fontStyle: "italic",
  },
  error: {
    color: "#dc2626",
    textAlign: "center",
    marginTop: 16,
  },
  resultCard: {
    padding: 20,
    backgroundColor: "#1a1a1a",
    borderRadius: 14,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#2a1545",
  },
  word: {
    marginBottom: 4,
    color: "#e2d6f5",
  },
  phonetic: {
    color: "#8b5cf6",
    fontSize: 16,
    marginBottom: 16,
    fontStyle: "italic",
  },
  meaning: {
    marginTop: 12,
  },
  partOfSpeech: {
    fontWeight: "bold",
    fontSize: 15,
    color: "#a855f7",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  definitionItem: {
    marginBottom: 10,
    paddingLeft: 14,
    borderLeftWidth: 2,
    borderLeftColor: "#7c3aed",
  },
  definitionText: {
    lineHeight: 22,
    color: "#c4c4c4",
  },
  example: {
    fontStyle: "italic",
    color: "#666",
    marginTop: 4,
  },
  saveButton: {
    marginTop: 24,
  },
  saveButtonInner: {
    borderRadius: 10,
    paddingVertical: 12,
    backgroundColor: "#7c3aed",
  },
  saveButtonText: {
    color: "#e8e0f0",
    fontWeight: "bold",
    letterSpacing: 1,
  },
});
