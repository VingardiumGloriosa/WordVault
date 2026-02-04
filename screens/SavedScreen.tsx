import { useCallback, useState } from "react";
import { View, Alert, StyleSheet, SafeAreaView } from "react-native";
import { Text, Button, Divider } from "@rneui/themed";
import { FlatList } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../auth/AuthProvider";
import { fetchSavedWords, deleteSavedWord } from "../lib/savedWords";

interface SavedWord {
  id: string;
  word: string;
  phonetic?: string;
  definition: string;
  part_of_speech: string;
}

export default function SavedScreen() {
  const { session } = useAuth();
  const [words, setWords] = useState<SavedWord[]>([]);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (session) {
        setError(null);
        fetchSavedWords(session.user.id)
          .then(setWords)
          .catch((err) => {
            setError(
              err instanceof Error ? err.message : "Failed to load saved words",
            );
          });
      }
    }, [session]),
  );

  const handleDelete = (id: string, word: string) => {
    Alert.alert("Remove Word", `Remove "${word}" from saved words?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteSavedWord(id);
            setWords((prev) => prev.filter((w) => w.id !== id));
          } catch (err) {
            if (err instanceof Error) {
              Alert.alert("Error", err.message);
            }
          }
        },
      },
    ]);
  };

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <Text style={styles.error}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
    <FlatList
      data={words}
      keyExtractor={(item) => item.id}
      contentContainerStyle={words.length === 0 ? styles.emptyContainer : styles.listContainer}
      ItemSeparatorComponent={() => <Divider style={styles.divider} />}
      ListEmptyComponent={
        <View style={styles.centered}>
          <Text h4 style={styles.emptyTitle}>Nothing here yet</Text>
          <Text style={styles.emptySubtitle}>Search for words and save them to build your collection.</Text>
        </View>
      }
      renderItem={({ item }) => (
        <View style={styles.item}>
          <View style={styles.itemHeader}>
            <Text h4 style={styles.wordText}>{item.word}</Text>
            <Text style={styles.partOfSpeech}>{item.part_of_speech}</Text>
          </View>
          <Text style={styles.definition}>{item.definition}</Text>
          <Button
            type="clear"
            title="Remove"
            titleStyle={styles.removeTitle}
            onPress={() => handleDelete(item.id, item.word)}
          />
        </View>
      )}
    />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0a0a0a",
  },
  listContainer: {
    paddingVertical: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
  },
  item: {
    padding: 16,
  },
  itemHeader: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
    marginBottom: 4,
  },
  wordText: {
    color: "#e2d6f5",
  },
  partOfSpeech: {
    fontStyle: "italic",
    color: "#8b5cf6",
  },
  definition: {
    marginTop: 4,
    color: "#a3a3a3",
    lineHeight: 20,
  },
  removeTitle: {
    color: "#dc2626",
    fontSize: 13,
    letterSpacing: 0.5,
  },
  divider: {
    marginHorizontal: 16,
    backgroundColor: "#2a1545",
  },
  centered: {
    padding: 32,
    alignItems: "center",
  },
  emptyTitle: {
    marginBottom: 8,
    color: "#777",
  },
  emptySubtitle: {
    color: "#555",
    textAlign: "center",
    lineHeight: 22,
  },
  error: {
    color: "#dc2626",
  },
});
