import { useCallback, useState } from "react";
import { View, Alert, StyleSheet } from "react-native";
import { Text, Button } from "@rneui/themed";
import { FlatList } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../auth/AuthProvider";
import { fetchSavedWords, deleteSavedWord } from "../lib/savedWords";

export default function SavedScreen() {
  const { session } = useAuth();
  const [words, setWords] = useState<any[]>([]);
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
      <View style={styles.centered}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={words}
      keyExtractor={(item) => item.id}
      ListEmptyComponent={
        <View style={styles.centered}>
          <Text>No saved words yet. Search and save some!</Text>
        </View>
      }
      renderItem={({ item }) => (
        <View style={styles.item}>
          <Text h4>{item.word}</Text>
          <Text>{item.part_of_speech}</Text>
          <Text>{item.definition}</Text>
          <Button
            type="clear"
            title="Remove"
            onPress={() => handleDelete(item.id, item.word)}
          />
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  item: {
    padding: 16,
  },
  centered: {
    padding: 32,
    alignItems: "center",
  },
  error: {
    color: "red",
  },
});
