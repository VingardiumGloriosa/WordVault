import { useState, useEffect, useRef, useCallback } from "react";
import { View, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, Animated } from "react-native";
import { Input, Text, Button } from "@rneui/themed";
import { useNavigation } from "@react-navigation/native";
import { Audio } from "expo-av";
import { useDictionaryStore } from "../store/dictionaryStore";
import { useAuth } from "../auth/AuthProvider";
import { useLearnStore } from "../store/learnStore";
import { checkIfSaved, fetchUserTags } from "../lib/savedWords";
import { getWordOfTheDay } from "../lib/wordOfTheDay";
import { Ionicons } from "@expo/vector-icons";
import { colors, fonts, ornament } from "../theme";
import ScreenContainer from "../components/ScreenContainer";
import TagAutocompleteInput from "../components/TagAutocompleteInput";
import { useKeyboardShortcut } from "../lib/useKeyboardShortcut";
import { SkeletonLine } from "../components/Skeleton";
import { pulseAnimation } from "../lib/animations";

export default function SearchScreen() {
  const { search, result, loading, error, saveCurrentWord, clearResult, recentSearches } =
    useDictionaryStore();
  const { session } = useAuth();
  const { stats, loadStats } = useLearnStore();
  const navigation = useNavigation<any>();
  const [searchText, setSearchText] = useState("");
  const [tagText, setTagText] = useState("");
  const [saveMessage, setSaveMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [alreadySaved, setAlreadySaved] = useState(false);
  const [existingTags, setExistingTags] = useState<string[]>([]);
  const [audioState, setAudioState] = useState<"idle" | "loading" | "playing">("idle");
  const soundRef = useRef<Audio.Sound | null>(null);
  const saveMessageTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchInputRef = useRef<any>(null);
  const saveButtonScale = useRef(new Animated.Value(1)).current;
  const [wordOfTheDay, setWordOfTheDay] = useState<string | null>(null);

  useEffect(() => {
    getWordOfTheDay().then(setWordOfTheDay);
  }, []);

  const focusSearch = useCallback(() => {
    searchInputRef.current?.focus();
  }, []);
  useKeyboardShortcut("/", focusSearch);
  useKeyboardShortcut("k", focusSearch, { ctrl: true });

  const showSaveMessage = useCallback((msg: { text: string; type: "success" | "error" }) => {
    if (saveMessageTimerRef.current) clearTimeout(saveMessageTimerRef.current);
    setSaveMessage(msg);
    saveMessageTimerRef.current = setTimeout(() => setSaveMessage(null), 3000);
  }, []);

  useEffect(() => {
    return () => {
      if (saveMessageTimerRef.current) clearTimeout(saveMessageTimerRef.current);
    };
  }, []);

  const entry = result?.[0];

  const audioUrl = entry?.phonetics?.find((p) => p.audio)?.audio || null;

  useEffect(() => {
    if (session) {
      fetchUserTags(session.user.id).then(setExistingTags).catch((err) => {
        console.warn("Failed to load tags:", err);
      });
      loadStats(session.user.id, null);
    }
  }, [session]);

  useEffect(() => {
    if (entry && session) {
      checkIfSaved(entry.word, session.user.id).then(setAlreadySaved);
    } else {
      setAlreadySaved(false);
    }
  }, [entry?.word, session]);

  useEffect(() => {
    return () => {
      soundRef.current?.unloadAsync();
    };
  }, []);

  const playAudio = async () => {
    if (!audioUrl || audioState !== "idle") return;
    setAudioState("loading");
    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }
      const { sound } = await Audio.Sound.createAsync({ uri: audioUrl });
      soundRef.current = sound;
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setAudioState("idle");
        }
      });
      await sound.playAsync();
      setAudioState("playing");
    } catch {
      setAudioState("idle");
    }
  };

  const handleSave = async () => {
    if (!session || !entry) return;
    try {
      await saveCurrentWord(entry, session.user.id, tagText);
      pulseAnimation(saveButtonScale).start();
      showSaveMessage({ text: `"${entry.word}" added to your collection`, type: "success" });
      setTagText("");
      setAlreadySaved(true);
      fetchUserTags(session.user.id).then(setExistingTags).catch((err) => {
        console.warn("Failed to refresh tags:", err);
      });
    } catch (err: any) {
      showSaveMessage({ text: err?.message ?? "Something went wrong", type: "error" });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <ScreenContainer>
        <Text style={styles.screenTitle}>Search</Text>
        <Text style={styles.screenOrnament}>{ornament}</Text>

        <View style={styles.searchWrap}>
          <Input
            ref={searchInputRef}
            placeholder="enter a word..."
            placeholderTextColor={colors.ghost}
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={() => { setSaveMessage(null); search(searchText); }}
            returnKeyType="search"
            leftIcon={<Ionicons name="search" size={18} color={colors.amberMuted} />}
            containerStyle={styles.searchContainer}
            inputStyle={styles.inputText}
            inputContainerStyle={styles.inputInner}
          />
        </View>

        {loading && (
          <View style={styles.resultCard}>
            <SkeletonLine width="50%" height={24} />
            <SkeletonLine width="30%" height={14} style={{ marginTop: 10 }} />
            <View style={[styles.dividerLine, { marginVertical: 14 }]} />
            <SkeletonLine width="20%" height={10} />
            <SkeletonLine width="100%" height={14} style={{ marginTop: 10 }} />
            <SkeletonLine width="90%" height={14} style={{ marginTop: 6 }} />
            <SkeletonLine width="70%" height={14} style={{ marginTop: 6 }} />
          </View>
        )}

        {error && <Text style={styles.error}>{error}</Text>}

        {entry && (
          <View style={styles.resultCard}>
            <View style={styles.wordHeader}>
              <Text h2 h2Style={styles.word}>{entry.word}</Text>
              <View style={styles.phoneticRow}>
                {entry.phonetic && (
                  <Text style={styles.phonetic}>{entry.phonetic}</Text>
                )}
                {audioUrl && (
                  <TouchableOpacity
                    onPress={playAudio}
                    style={styles.audioButton}
                    disabled={audioState !== "idle"}
                    accessibilityLabel="Play pronunciation"
                    accessibilityRole="button"
                  >
                    {audioState === "loading" ? (
                      <ActivityIndicator size={16} color={colors.ember} />
                    ) : (
                      <Ionicons
                        name={audioState === "playing" ? "volume-high" : "volume-medium"}
                        size={20}
                        color={audioState === "playing" ? colors.amber : colors.ember}
                      />
                    )}
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <View style={styles.dividerLine} />

            {entry.meanings.map((meaning, i) => (
              <View key={i} style={styles.meaningBlock}>
                <Text style={styles.partOfSpeech}>{meaning.partOfSpeech}</Text>

                {meaning.definitions.map((def, j) => (
                  <View key={j} style={styles.definitionItem}>
                    <Text style={styles.defNumber}>{j + 1}.</Text>
                    <View style={styles.defContent}>
                      <Text style={styles.definitionText}>{def.definition}</Text>
                      {def.example && (
                        <Text style={styles.example}>"{def.example}"</Text>
                      )}
                    </View>
                  </View>
                ))}

                {i < entry.meanings.length - 1 && (
                  <Text style={styles.meaningDivider}>{ornament}</Text>
                )}
              </View>
            ))}

            <View style={styles.saveWrap}>
              {session ? (
                <>
                {saveMessage && (
                  <Text style={saveMessage.type === "success" ? styles.saveSuccess : styles.saveError}>
                    {saveMessage.text}
                  </Text>
                )}
                {alreadySaved ? (
                  <View style={styles.savedBadge}>
                    <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                    <Text style={styles.savedBadgeText}>Already in Collection</Text>
                  </View>
                ) : (
                  <>
                    <View style={styles.tagContainer}>
                      <TagAutocompleteInput
                        value={tagText}
                        onChangeText={setTagText}
                        existingTags={existingTags}
                      />
                    </View>
                    <Animated.View style={{ transform: [{ scale: saveButtonScale }] }}>
                      <Button
                        title="Save to Collection"
                        onPress={handleSave}
                        buttonStyle={styles.saveButton}
                        titleStyle={styles.saveButtonText}
                        containerStyle={styles.saveContainer}
                      />
                    </Animated.View>
                  </>
                )}
                </>
              ) : (
                <Button
                  title="Sign In to Save"
                  onPress={() => navigation.navigate("Profile")}
                  type="outline"
                  buttonStyle={styles.guestSaveButton}
                  titleStyle={styles.guestSaveButtonText}
                  containerStyle={styles.saveContainer}
                />
              )}
            </View>
          </View>
        )}

        {!entry && !loading && !error && (
          <View style={styles.emptyState}>
            <View style={styles.wotdCard}>
              <Text style={styles.wotdLabel}>WORD OF THE DAY</Text>
              <Text style={styles.wotdOrnament}>{ornament}</Text>
              {wordOfTheDay ? (
                <>
                  <Text style={styles.wotdWord}>{wordOfTheDay}</Text>
                  <TouchableOpacity
                    onPress={() => { setSearchText(wordOfTheDay); search(wordOfTheDay); }}
                    style={styles.wotdAction}
                  >
                    <Text style={styles.wotdActionText}>Look it up</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <SkeletonLine width="50%" height={28} style={{ marginBottom: 16 }} />
              )}
            </View>

            {recentSearches.length > 0 && (
              <View style={styles.recentSection}>
                <Text style={styles.recentLabel}>RECENT</Text>
                <View style={styles.recentRow}>
                  {recentSearches.map((word) => (
                    <TouchableOpacity
                      key={word}
                      style={styles.recentTag}
                      onPress={() => { setSearchText(word); search(word); }}
                    >
                      <Text style={styles.recentTagText}>{word}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {session && stats.due > 0 && (
              <TouchableOpacity
                style={styles.dueNudge}
                onPress={() => navigation.navigate("Learn")}
              >
                <Ionicons name="bulb-outline" size={16} color={colors.amber} />
                <Text style={styles.dueNudgeText}>
                  You have {stats.due} word{stats.due === 1 ? "" : "s"} due for review
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScreenContainer>
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.void,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  screenTitle: {
    color: colors.bone,
    textAlign: "center",
    fontSize: 13,
    letterSpacing: 4,
    textTransform: "uppercase",
    marginTop: 4,
    fontFamily: fonts.body,
  },
  screenOrnament: {
    color: colors.faded,
    textAlign: "center",
    fontSize: 12,
    letterSpacing: 6,
    marginTop: 6,
    marginBottom: 20,
    fontFamily: fonts.body,
  },
  searchWrap: {
    backgroundColor: colors.obsidian,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.charcoal,
    paddingTop: 4,
    marginBottom: 8,
  },
  searchContainer: {
    marginBottom: -8,
  },
  inputInner: {
    borderBottomColor: "transparent",
  },
  inputText: {
    color: colors.bone,
    fontSize: 15,
    fontFamily: fonts.body,
  },
  loadingText: {
    textAlign: "center",
    color: colors.ember,
    marginTop: 24,
    fontStyle: "italic",
    letterSpacing: 1,
    fontSize: 14,
    fontFamily: fonts.body,
  },
  error: {
    color: colors.bloodBright,
    textAlign: "center",
    marginTop: 24,
    fontSize: 14,
    fontFamily: fonts.body,
  },
  resultCard: {
    backgroundColor: colors.obsidian,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.charcoal,
    padding: 24,
    marginTop: 12,
  },
  wordHeader: {
    marginBottom: 4,
  },
  phoneticRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  audioButton: {
    padding: 4,
  },
  savedBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.success,
    backgroundColor: colors.successBg,
  },
  savedBadgeText: {
    color: colors.success,
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 1,
    fontFamily: fonts.body,
  },
  word: {
    color: colors.bone,
    fontWeight: "300",
    letterSpacing: 2,
    fontFamily: fonts.display,
  },
  phonetic: {
    color: colors.ember,
    fontSize: 15,
    fontStyle: "italic",
    letterSpacing: 1,
    fontFamily: fonts.body,
  },
  dividerLine: {
    height: 1,
    backgroundColor: colors.charcoal,
    marginVertical: 18,
  },
  meaningBlock: {
    marginBottom: 8,
  },
  partOfSpeech: {
    color: colors.wineLight,
    fontSize: 12,
    letterSpacing: 3,
    textTransform: "uppercase",
    marginBottom: 12,
    fontWeight: "700",
    fontFamily: fonts.body,
  },
  definitionItem: {
    flexDirection: "row",
    marginBottom: 14,
    paddingLeft: 4,
  },
  defNumber: {
    color: colors.amberMuted,
    fontSize: 13,
    fontWeight: "700",
    marginRight: 10,
    marginTop: 1,
    minWidth: 16,
    fontFamily: fonts.body,
  },
  defContent: {
    flex: 1,
  },
  definitionText: {
    lineHeight: 23,
    color: colors.parchment,
    fontSize: 15,
    fontFamily: fonts.body,
  },
  example: {
    fontStyle: "italic",
    color: colors.ash,
    marginTop: 6,
    fontSize: 14,
    lineHeight: 21,
    paddingLeft: 12,
    borderLeftWidth: 1,
    borderLeftColor: colors.charcoal,
    fontFamily: fonts.body,
  },
  meaningDivider: {
    color: colors.faded,
    textAlign: "center",
    fontSize: 11,
    letterSpacing: 6,
    marginVertical: 14,
    fontFamily: fonts.body,
  },
  saveWrap: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: colors.charcoal,
    paddingTop: 20,
  },
  tagContainer: {
    marginBottom: 12,
  },
  saveContainer: {},
  saveButton: {
    borderRadius: 12,
    paddingVertical: 13,
    backgroundColor: colors.wine,
  },
  saveButtonText: {
    color: colors.bone,
    fontWeight: "700",
    letterSpacing: 2,
    textTransform: "uppercase",
    fontSize: 12,
    fontFamily: fonts.body,
  },
  guestSaveButton: {
    borderRadius: 12,
    paddingVertical: 13,
    borderColor: colors.charcoal,
    borderWidth: 1,
    backgroundColor: "transparent",
  },
  guestSaveButtonText: {
    color: colors.ash,
    fontWeight: "700",
    letterSpacing: 2,
    textTransform: "uppercase",
    fontSize: 12,
    fontFamily: fonts.body,
  },
  emptyState: {
    marginTop: 24,
  },
  wotdCard: {
    backgroundColor: colors.obsidian,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.charcoal,
    padding: 28,
    alignItems: "center",
  },
  wotdLabel: {
    color: colors.ghost,
    fontSize: 10,
    letterSpacing: 3,
    marginBottom: 8,
    fontFamily: fonts.body,
  },
  wotdOrnament: {
    color: colors.faded,
    fontSize: 11,
    letterSpacing: 6,
    marginBottom: 16,
    fontFamily: fonts.body,
  },
  wotdWord: {
    color: colors.bone,
    fontSize: 28,
    fontWeight: "300",
    letterSpacing: 2,
    marginBottom: 16,
    fontFamily: fonts.display,
  },
  wotdAction: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.wine,
  },
  wotdActionText: {
    color: colors.wineLight,
    fontSize: 12,
    letterSpacing: 2,
    textTransform: "uppercase",
    fontWeight: "400",
    fontFamily: fonts.body,
  },
  recentSection: {
    marginTop: 24,
  },
  recentLabel: {
    color: colors.ghost,
    fontSize: 10,
    letterSpacing: 3,
    marginBottom: 10,
    fontFamily: fonts.body,
  },
  recentRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  recentTag: {
    backgroundColor: colors.smoke,
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.charcoal,
  },
  recentTagText: {
    color: colors.parchment,
    fontSize: 13,
    fontFamily: fonts.body,
  },
  dueNudge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 20,
    backgroundColor: colors.smoke,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.charcoal,
  },
  dueNudgeText: {
    color: colors.parchment,
    fontSize: 13,
    fontStyle: "italic",
    fontFamily: fonts.body,
  },
  saveSuccess: {
    color: colors.success,
    textAlign: "center" as const,
    marginBottom: 12,
    fontSize: 14,
    fontFamily: fonts.body,
  },
  saveError: {
    color: colors.bloodBright,
    textAlign: "center" as const,
    marginBottom: 12,
    fontSize: 14,
    fontFamily: fonts.body,
  },
  emptyText: {
    color: colors.ghost,
    textAlign: "center",
    lineHeight: 22,
    fontStyle: "italic",
    fontSize: 14,
    fontFamily: fonts.body,
  },
});
