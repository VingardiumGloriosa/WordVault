import { useCallback, useState } from "react";
import { View, Alert, StyleSheet, SafeAreaView } from "react-native";
import { Text, Button } from "@rneui/themed";
import { FlatList } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../auth/AuthProvider";
import { fetchSavedWords, deleteSavedWord } from "../lib/savedWords";
import { colors, ornament } from "../theme";

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
    Alert.alert("Remove Word", `Remove "${word}" from your collection?`, [
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

  const renderHeader = () => (
    <View style={styles.headerBlock}>
      <Text style={styles.screenTitle}>Collection</Text>
      <Text style={styles.screenOrnament}>{ornament}</Text>
      {words.length > 0 && (
        <Text style={styles.count}>{words.length} {words.length === 1 ? "word" : "words"} saved</Text>
      )}
    </View>
  );

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        {renderHeader()}
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
        ListHeaderComponent={renderHeader}
        contentContainerStyle={words.length === 0 ? styles.emptyContainer : styles.listContainer}
        ItemSeparatorComponent={() => (
          <Text style={styles.itemDivider}>{ornament}</Text>
        )}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={styles.emptyIcon}>{"\u{1F4DA}"}</Text>
            <Text style={styles.emptyTitle}>Your collection is empty</Text>
            <Text style={styles.emptySubtitle}>
              Search for words and save them{"\n"}to build your personal lexicon.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.wordText}>{item.word}</Text>
              <Text style={styles.partOfSpeech}>{item.part_of_speech}</Text>
            </View>
            <Text style={styles.definition}>{item.definition}</Text>
            <Button
              type="clear"
              title="remove"
              titleStyle={styles.removeTitle}
              onPress={() => handleDelete(item.id, item.word)}
              containerStyle={styles.removeButton}
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
    backgroundColor: colors.void,
  },
  headerBlock: {
    alignItems: "center",
    paddingTop: 12,
    paddingBottom: 8,
  },
  screenTitle: {
    color: colors.bone,
    fontSize: 13,
    letterSpacing: 4,
    textTransform: "uppercase",
  },
  screenOrnament: {
    color: colors.faded,
    fontSize: 12,
    letterSpacing: 6,
    marginTop: 6,
  },
  count: {
    color: colors.ash,
    fontSize: 12,
    marginTop: 10,
    letterSpacing: 1,
    fontStyle: "italic",
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  emptyContainer: {
    flex: 1,
  },
  card: {
    backgroundColor: colors.obsidian,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.charcoal,
    padding: 18,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  wordText: {
    color: colors.bone,
    fontSize: 20,
    fontWeight: "300",
    letterSpacing: 1,
  },
  partOfSpeech: {
    fontStyle: "italic",
    color: colors.wineLight,
    fontSize: 12,
    letterSpacing: 1,
  },
  definition: {
    color: colors.parchment,
    lineHeight: 22,
    fontSize: 14,
  },
  removeButton: {
    alignSelf: "flex-end",
    marginTop: 8,
  },
  removeTitle: {
    color: colors.blood,
    fontSize: 11,
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  itemDivider: {
    color: colors.faded,
    textAlign: "center",
    fontSize: 10,
    letterSpacing: 6,
    marginVertical: 12,
  },
  centered: {
    flex: 1,
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 16,
    opacity: 0.4,
  },
  emptyTitle: {
    color: colors.ash,
    fontSize: 16,
    fontWeight: "300",
    letterSpacing: 1,
    marginBottom: 8,
  },
  emptySubtitle: {
    color: colors.ghost,
    textAlign: "center",
    lineHeight: 22,
    fontStyle: "italic",
    fontSize: 14,
  },
  error: {
    color: colors.bloodBright,
  },
});
