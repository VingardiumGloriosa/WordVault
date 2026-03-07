import { useCallback, useMemo, useState } from "react";
import {
  View,
  Alert,
  Platform,
  StyleSheet,
  SafeAreaView,
  Modal,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { Text, Button } from "@rneui/themed";
import { FlatList } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../auth/AuthProvider";
import { fetchSavedWords, deleteSavedWord, updateWordTag } from "../lib/savedWords";
import GuestPrompt from "../components/GuestPrompt";
import TagDropdown from "../components/TagDropdown";
import { colors, ornament } from "../theme";
import ScreenContainer from "../components/ScreenContainer";

interface SavedWord {
  id: string;
  word: string;
  phonetic?: string;
  definition: string;
  part_of_speech: string;
  tag?: string;
}

export default function SavedScreen() {
  const { session } = useAuth();
  const [words, setWords] = useState<SavedWord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [editingWord, setEditingWord] = useState<SavedWord | null>(null);
  const [editTagText, setEditTagText] = useState("");

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

  const uniqueTags = useMemo(() => {
    const tags = new Set<string>();
    for (const w of words) {
      if (w.tag) tags.add(w.tag);
    }
    return Array.from(tags);
  }, [words]);

  const filteredWords = selectedTag
    ? words.filter((w) => w.tag === selectedTag)
    : words;

  const handleDelete = async (id: string, word: string) => {
    const doDelete = async () => {
      try {
        await deleteSavedWord(id);
        setWords((prev) => prev.filter((w) => w.id !== id));
      } catch (err) {
        if (err instanceof Error) {
          Alert.alert("Error", err.message);
        }
      }
    };

    if (Platform.OS === "web") {
      if (window.confirm(`Remove "${word}" from your collection?`)) {
        await doDelete();
      }
    } else {
      Alert.alert("Remove Word", `Remove "${word}" from your collection?`, [
        { text: "Cancel", style: "cancel" },
        { text: "Remove", style: "destructive", onPress: doDelete },
      ]);
    }
  };

  const handleEditTag = async () => {
    if (!editingWord) return;
    const newTag = editTagText.trim() || null;
    try {
      await updateWordTag(editingWord.id, newTag);
      setWords((prev) =>
        prev.map((w) =>
          w.id === editingWord.id ? { ...w, tag: newTag ?? undefined } : w,
        ),
      );
      setEditingWord(null);
    } catch (err) {
      Alert.alert("Error", err instanceof Error ? err.message : "Failed to update tag");
    }
  };

  const renderRightActions = (item: SavedWord) => (
    <View style={styles.swipeActions}>
      <TouchableOpacity
        style={styles.swipeEditTag}
        onPress={() => {
          setEditingWord(item);
          setEditTagText(item.tag ?? "");
        }}
      >
        <Text style={styles.swipeActionText}>Edit{"\n"}Tag</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.swipeRemove}
        onPress={() => handleDelete(item.id, item.word)}
      >
        <Text style={styles.swipeActionText}>Remove</Text>
      </TouchableOpacity>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.headerBlock}>
      <Text style={styles.screenTitle}>Collection</Text>
      <Text style={styles.screenOrnament}>{ornament}</Text>
      {words.length > 0 && (
        <Text style={styles.count}>
          {selectedTag
            ? `${filteredWords.length} of ${words.length} words`
            : `${words.length} ${words.length === 1 ? "word" : "words"} saved`}
        </Text>
      )}
      {uniqueTags.length > 0 && (
        <TagDropdown
          tags={uniqueTags}
          selectedTag={selectedTag}
          onSelectTag={setSelectedTag}
        />
      )}
    </View>
  );

  if (!session) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScreenContainer>
        {renderHeader()}
        <GuestPrompt
          icon={"\u{1F4DA}"}
          title="Your Collection Awaits"
          message={"Sign in to save words and\nbuild your personal lexicon."}
        />
        </ScreenContainer>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScreenContainer>
        {renderHeader()}
        <View style={styles.centered}>
          <Text style={styles.error}>{error}</Text>
        </View>
        </ScreenContainer>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={filteredWords}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={filteredWords.length === 0 ? styles.emptyContainer : styles.listContainer}
        ItemSeparatorComponent={() => (
          <Text style={styles.itemDivider}>{ornament}</Text>
        )}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={styles.emptyIcon}>{"\u{1F4DA}"}</Text>
            <Text style={styles.emptyTitle}>
              {selectedTag ? "No words with this tag" : "Your collection is empty"}
            </Text>
            <Text style={styles.emptySubtitle}>
              {selectedTag
                ? "Try selecting a different tag or clear the filter."
                : "Search for words and save them\nto build your personal lexicon."}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <Swipeable renderRightActions={() => renderRightActions(item)}>
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.wordText}>{item.word}</Text>
                <Text style={styles.partOfSpeech}>{item.part_of_speech}</Text>
              </View>
              <Text style={styles.definition}>{item.definition}</Text>
              {item.tag && <Text style={styles.tag}>{item.tag}</Text>}
            </View>
          </Swipeable>
        )}
      />

      <Modal
        visible={editingWord !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setEditingWord(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Edit Tag</Text>
            <Text style={styles.modalWord}>{editingWord?.word}</Text>
            <TextInput
              style={styles.modalInput}
              value={editTagText}
              onChangeText={setEditTagText}
              placeholder="Tag (leave empty to remove)"
              placeholderTextColor={colors.ghost}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancel}
                onPress={() => setEditingWord(null)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSave}
                onPress={handleEditTag}
              >
                <Text style={styles.modalSaveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    maxWidth: 480,
    width: "100%",
    alignSelf: "center",
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  emptyContainer: {
    flex: 1,
    maxWidth: 480,
    width: "100%",
    alignSelf: "center",
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
  tag: {
    color: colors.amberMuted,
    fontStyle: "italic",
    fontSize: 12,
    marginTop: 6,
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
  // Swipe actions
  swipeActions: {
    flexDirection: "row",
    alignItems: "stretch",
  },
  swipeEditTag: {
    backgroundColor: colors.amberMuted,
    justifyContent: "center",
    alignItems: "center",
    width: 72,
    borderRadius: 8,
    marginLeft: 8,
  },
  swipeRemove: {
    backgroundColor: colors.blood,
    justifyContent: "center",
    alignItems: "center",
    width: 72,
    borderRadius: 8,
    marginLeft: 8,
  },
  swipeActionText: {
    color: colors.bone,
    fontSize: 11,
    fontWeight: "500",
    textAlign: "center",
    letterSpacing: 1,
  },
  // Edit tag modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCard: {
    backgroundColor: colors.obsidian,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.charcoal,
    padding: 24,
    width: 300,
  },
  modalTitle: {
    color: colors.bone,
    fontSize: 16,
    fontWeight: "300",
    letterSpacing: 2,
    textAlign: "center",
    marginBottom: 4,
  },
  modalWord: {
    color: colors.ash,
    fontSize: 13,
    fontStyle: "italic",
    textAlign: "center",
    marginBottom: 16,
  },
  modalInput: {
    backgroundColor: colors.smoke,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.charcoal,
    color: colors.bone,
    fontSize: 14,
    padding: 12,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
  modalCancel: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  modalCancelText: {
    color: colors.ash,
    fontSize: 13,
    letterSpacing: 1,
  },
  modalSave: {
    backgroundColor: colors.wine,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  modalSaveText: {
    color: colors.bone,
    fontSize: 13,
    fontWeight: "500",
    letterSpacing: 1,
  },
});
