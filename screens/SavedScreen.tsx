import { useCallback, useMemo, useState, useRef, useEffect } from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Text, Button } from "@rneui/themed";
import { FlatList } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../auth/AuthProvider";
import { fetchSavedWords, deleteSavedWord, updateWordTag, deleteTag, saveWord } from "../lib/savedWords";
import { getCachedEntry, DictionaryEntry } from "../store/dictionaryStore";
import GuestPrompt from "../components/GuestPrompt";
import TagDropdown from "../components/TagDropdown";
import TagAutocompleteInput from "../components/TagAutocompleteInput";
import { colors, fonts, ornament } from "../theme";
import ScreenContainer from "../components/ScreenContainer";
import { SkeletonCard } from "../components/Skeleton";

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [editingWord, setEditingWord] = useState<SavedWord | null>(null);
  const [editTagText, setEditTagText] = useState("");
  const [undoItem, setUndoItem] = useState<SavedWord | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [confirmDeleteTag, setConfirmDeleteTag] = useState<string | null>(null);
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [expandedData, setExpandedData] = useState<DictionaryEntry | null>(null);
  const [expandLoading, setExpandLoading] = useState(false);

  useEffect(() => {
    return () => {
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const showToast = (message: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast(message);
    toastTimerRef.current = setTimeout(() => setToast(null), 4000);
  };

  useFocusEffect(
    useCallback(() => {
      if (session) {
        setError(null);
        setLoading(true);
        fetchSavedWords(session.user.id)
          .then(setWords)
          .catch((err) => {
            setError(
              err instanceof Error ? err.message : "Failed to load saved words",
            );
          })
          .finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    }, [session]),
  );

  const uniqueTags = useMemo(() => {
    const seen = new Map<string, string>();
    for (const w of words) {
      if (w.tag) {
        const key = w.tag.toLowerCase();
        if (!seen.has(key)) seen.set(key, key);
      }
    }
    return Array.from(seen.values());
  }, [words]);

  const filteredWords = selectedTag === "__untagged__"
    ? words.filter((w) => !w.tag)
    : selectedTag
      ? words.filter((w) => w.tag?.toLowerCase() === selectedTag.toLowerCase())
      : words;

  const handleDelete = async (id: string) => {
    try {
      const deleted = words.find((w) => w.id === id);
      await deleteSavedWord(id);
      setWords((prev) => prev.filter((w) => w.id !== id));
      if (deleted) {
        if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
        setUndoItem(deleted);
        undoTimerRef.current = setTimeout(() => setUndoItem(null), 5000);
      }
    } catch (err) {
      if (err instanceof Error) showToast(err.message);
    }
  };

  const handleUndo = async () => {
    if (!undoItem || !session) return;
    try {
      await saveWord({
        userId: session.user.id,
        word: undoItem.word,
        phonetic: undoItem.phonetic,
        definition: undoItem.definition,
        partOfSpeech: undoItem.part_of_speech,
        tag: undoItem.tag,
      });
      // Refresh list to get the new ID
      const refreshed = await fetchSavedWords(session.user.id);
      setWords(refreshed);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to restore word");
    } finally {
      setUndoItem(null);
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    }
  };

  const handleDeleteTag = (tag: string) => {
    setConfirmDeleteTag(tag);
  };

  const confirmDeleteTagAction = async () => {
    if (!session || !confirmDeleteTag) return;
    const tag = confirmDeleteTag;
    setConfirmDeleteTag(null);
    try {
      await deleteTag(session.user.id, tag);
      setWords((prev) =>
        prev.map((w) =>
          w.tag?.toLowerCase() === tag.toLowerCase()
            ? { ...w, tag: undefined }
            : w,
        ),
      );
      if (selectedTag?.toLowerCase() === tag.toLowerCase()) {
        setSelectedTag(null);
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to delete tag");
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
      showToast(err instanceof Error ? err.message : "Failed to update tag");
    }
  };

  const handleCardTap = async (item: SavedWord) => {
    if (expandedId === item.id) {
      setExpandedId(null);
      setExpandedData(null);
      return;
    }
    setExpandedId(item.id);
    setExpandedData(null);

    const cached = getCachedEntry(item.word);
    if (cached) {
      setExpandedData(cached[0]);
      return;
    }

    setExpandLoading(true);
    try {
      const API_URL = process.env.EXPO_PUBLIC_DICTIONARY_API_URL;
      const res = await fetch(`${API_URL}/${encodeURIComponent(item.word.toLowerCase())}`);
      if (res.ok) {
        const data = await res.json();
        setExpandedData(data[0]);
      }
    } catch {
      // Fallback: show stored definition only
    } finally {
      setExpandLoading(false);
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
        accessibilityLabel="Edit tag"
        accessibilityRole="button"
      >
        <Text style={styles.swipeActionText}>Edit{"\n"}Tag</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.swipeRemove}
        onPress={() => handleDelete(item.id)}
        accessibilityLabel="Remove word"
        accessibilityRole="button"
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
            ? `${filteredWords.length} of ${words.length} words${selectedTag === "__untagged__" ? " (untagged)" : ""}`
            : `${words.length} ${words.length === 1 ? "word" : "words"} saved`}
        </Text>
      )}
      {uniqueTags.length > 0 && (
        <TagDropdown
          tags={uniqueTags}
          selectedTag={selectedTag}
          onSelectTag={setSelectedTag}
          onDeleteTag={handleDeleteTag}
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
        <View style={styles.centered}>
          <Text style={styles.emptyIcon}>{"\u{1F4DA}"}</Text>
          <Text style={styles.emptyTitle}>Your collection is empty</Text>
          <Text style={styles.emptySubtitle}>
            Search for words and save them{"\n"}to build your personal lexicon.
          </Text>
        </View>
        </ScreenContainer>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScreenContainer>
        {renderHeader()}
        <View style={styles.skeletonContainer}>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </View>
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
            <TouchableOpacity activeOpacity={0.8} onPress={() => handleCardTap(item)}>
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.wordText}>{item.word}</Text>
                  <View style={styles.cardHeaderRight}>
                    <Text style={styles.partOfSpeech}>{item.part_of_speech}</Text>
                    <Text style={styles.chevron}>
                      {expandedId === item.id ? "\u25B4" : "\u25BE"}
                    </Text>
                  </View>
                </View>
                {expandedId !== item.id && (
                  <Text style={styles.definition} numberOfLines={2}>{item.definition}</Text>
                )}
                {item.tag && <Text style={styles.tag}>{item.tag}</Text>}

                {expandedId === item.id && (
                  <View style={styles.expandedSection}>
                    {expandLoading && (
                      <ActivityIndicator color={colors.ember} size="small" style={{ marginVertical: 12 }} />
                    )}
                    {expandedData ? (
                      <>
                        {expandedData.phonetic && (
                          <Text style={styles.expandedPhonetic}>{expandedData.phonetic}</Text>
                        )}
                        {expandedData.meanings.map((meaning, i) => (
                          <View key={i} style={styles.expandedMeaning}>
                            <Text style={styles.expandedPos}>{meaning.partOfSpeech}</Text>
                            {meaning.definitions.map((def, j) => (
                              <View key={j} style={styles.expandedDef}>
                                <Text style={styles.expandedDefNum}>{j + 1}.</Text>
                                <View style={{ flex: 1 }}>
                                  <Text style={styles.expandedDefText}>{def.definition}</Text>
                                  {def.example && (
                                    <Text style={styles.expandedExample}>"{def.example}"</Text>
                                  )}
                                </View>
                              </View>
                            ))}
                          </View>
                        ))}
                      </>
                    ) : !expandLoading ? (
                      <Text style={styles.definition}>{item.definition}</Text>
                    ) : null}
                  </View>
                )}
              </View>
            </TouchableOpacity>
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
            <View style={styles.modalInputWrap}>
              <TagAutocompleteInput
                value={editTagText}
                onChangeText={setEditTagText}
                existingTags={uniqueTags}
                placeholder="Tag (leave empty to remove)"
              />
            </View>
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

      <Modal
        visible={confirmDeleteTag !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmDeleteTag(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Delete Tag</Text>
            <Text style={styles.modalWord}>
              Remove "{confirmDeleteTag}" from all words?{"\n"}The words themselves will be kept.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancel}
                onPress={() => setConfirmDeleteTag(null)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalDelete}
                onPress={confirmDeleteTagAction}
              >
                <Text style={styles.modalSaveText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {undoItem && (
        <View style={styles.undoBanner}>
          <Text style={styles.undoText}>"{undoItem.word}" removed</Text>
          <TouchableOpacity onPress={handleUndo}>
            <Text style={styles.undoAction}>UNDO</Text>
          </TouchableOpacity>
        </View>
      )}

      {toast && !undoItem && (
        <View style={styles.toastBanner}>
          <Text style={styles.toastText}>{toast}</Text>
        </View>
      )}
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
    fontFamily: fonts.body,
    letterSpacing: 4,
    textTransform: "uppercase",
  },
  screenOrnament: {
    color: colors.faded,
    fontSize: 12,
    fontFamily: fonts.body,
    letterSpacing: 6,
    marginTop: 6,
  },
  count: {
    color: colors.ash,
    fontSize: 12,
    fontFamily: fonts.body,
    marginTop: 10,
    letterSpacing: 1,
    fontStyle: "italic",
  },
  skeletonContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
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
  cardHeaderRight: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
  },
  chevron: {
    color: colors.ghost,
    fontSize: 12,
    fontFamily: fonts.body,
  },
  wordText: {
    color: colors.bone,
    fontSize: 20,
    fontFamily: fonts.display,
    fontWeight: "300",
    letterSpacing: 1,
  },
  partOfSpeech: {
    fontFamily: fonts.body,
    fontStyle: "italic",
    color: colors.wineLight,
    fontSize: 12,
    letterSpacing: 1,
  },
  definition: {
    color: colors.parchment,
    fontFamily: fonts.body,
    lineHeight: 22,
    fontSize: 14,
  },
  tag: {
    color: colors.amberMuted,
    fontFamily: fonts.body,
    fontStyle: "italic",
    fontSize: 12,
    marginTop: 6,
  },
  itemDivider: {
    color: colors.faded,
    fontFamily: fonts.body,
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
    fontFamily: fonts.display,
    fontWeight: "300",
    letterSpacing: 1,
    marginBottom: 8,
  },
  emptySubtitle: {
    color: colors.ghost,
    fontFamily: fonts.body,
    textAlign: "center",
    lineHeight: 22,
    fontStyle: "italic",
    fontSize: 14,
  },
  error: {
    color: colors.bloodBright,
    fontFamily: fonts.body,
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
    fontFamily: fonts.body,
    fontSize: 11,
    fontWeight: "400",
    textAlign: "center",
    letterSpacing: 1,
  },
  // Edit tag modal
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
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
    fontFamily: fonts.display,
    fontSize: 16,
    fontWeight: "300",
    letterSpacing: 2,
    textAlign: "center",
    marginBottom: 4,
  },
  modalWord: {
    color: colors.ash,
    fontFamily: fonts.body,
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
    fontFamily: fonts.body,
    fontSize: 14,
    padding: 12,
    marginBottom: 16,
  },
  modalInputWrap: {
    marginBottom: 16,
    zIndex: 10,
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
    fontFamily: fonts.body,
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
    fontFamily: fonts.body,
    fontSize: 13,
    fontWeight: "400",
    letterSpacing: 1,
  },
  modalDelete: {
    backgroundColor: colors.blood,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  undoBanner: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: colors.smoke,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.charcoal,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 18,
  },
  undoText: {
    color: colors.parchment,
    fontFamily: fonts.body,
    fontSize: 13,
    flex: 1,
  },
  undoAction: {
    color: colors.ember,
    fontFamily: fonts.body,
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 2,
    marginLeft: 16,
  },
  toastBanner: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: colors.errorBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.blood,
    paddingVertical: 14,
    paddingHorizontal: 18,
  },
  toastText: {
    color: colors.bloodBright,
    fontFamily: fonts.body,
    fontSize: 13,
    textAlign: "center",
  },
  expandedSection: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.charcoal,
    paddingTop: 12,
  },
  expandedPhonetic: {
    color: colors.ember,
    fontFamily: fonts.body,
    fontSize: 14,
    fontStyle: "italic",
    letterSpacing: 1,
    marginBottom: 10,
  },
  expandedMeaning: {
    marginBottom: 8,
  },
  expandedPos: {
    color: colors.wineLight,
    fontFamily: fonts.body,
    fontSize: 11,
    letterSpacing: 3,
    textTransform: "uppercase",
    marginBottom: 8,
    fontWeight: "700",
  },
  expandedDef: {
    flexDirection: "row",
    marginBottom: 10,
    paddingLeft: 4,
  },
  expandedDefNum: {
    color: colors.amberMuted,
    fontFamily: fonts.body,
    fontSize: 12,
    fontWeight: "700",
    marginRight: 8,
    marginTop: 1,
    minWidth: 16,
  },
  expandedDefText: {
    color: colors.parchment,
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 21,
  },
  expandedExample: {
    color: colors.ash,
    fontFamily: fonts.body,
    fontStyle: "italic",
    fontSize: 13,
    lineHeight: 20,
    marginTop: 4,
    paddingLeft: 10,
    borderLeftWidth: 1,
    borderLeftColor: colors.charcoal,
  },
});
