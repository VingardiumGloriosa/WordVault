import { useCallback } from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import { Text } from "@rneui/themed";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAuth } from "../../auth/AuthProvider";
import { useLearnStore } from "../../store/learnStore";
import GuestPrompt from "../../components/GuestPrompt";
import TagDropdown from "../../components/TagDropdown";
import { colors, fonts, ornament } from "../../theme";
import { LearnStackParamList } from "../../navigation/LearnStack";
import ScreenContainer from "../../components/ScreenContainer";

type Nav = NativeStackNavigationProp<LearnStackParamList, "LearnHome">;

export default function LearnHomeScreen() {
  const { session } = useAuth();
  const navigation = useNavigation<Nav>();
  const {
    words,
    stats,
    loading,
    error,
    loadWords,
    loadStats,
    loadTags,
    selectedTag,
    setSelectedTag,
    availableTags,
  } = useLearnStore();

  useFocusEffect(
    useCallback(() => {
      if (session) {
        loadTags(session.user.id);
        loadWords(session.user.id, selectedTag);
        loadStats(session.user.id, selectedTag);
      }
    }, [session, selectedTag]),
  );

  const savedCount = words.length;
  const canFlashcards = savedCount >= 1;
  const canQuizMatch = savedCount >= 4;

  const tagParam = selectedTag ? { tag: selectedTag } : undefined;

  const modes = [
    {
      key: "flashcards",
      icon: "\u{1F0CF}",
      title: "Flashcards",
      subtitle: "Flip & review your words",
      enabled: canFlashcards,
      minWords: 1,
      onPress: () => navigation.navigate("Flashcards", tagParam),
    },
    {
      key: "quiz",
      icon: "\u{2753}",
      title: "Quiz",
      subtitle: "Multiple choice challenge",
      enabled: canQuizMatch,
      minWords: 4,
      onPress: () => navigation.navigate("Quiz", tagParam),
    },
    {
      key: "match",
      icon: "\u{1F3AF}",
      title: "Match",
      subtitle: "Pair words with definitions",
      enabled: canQuizMatch,
      minWords: 4,
      onPress: () => navigation.navigate("MatchGame", tagParam),
    },
  ];

  if (!session) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScreenContainer>
        <View style={styles.headerBlock}>
          <Text style={styles.screenTitle}>Learn</Text>
          <Text style={styles.screenOrnament}>{ornament}</Text>
        </View>
        <GuestPrompt
          icon={"\u{1F9E0}"}
          title="Learning Hub"
          message={"Sign in to access flashcards,\nquizzes, and word matching."}
        />
        <View style={styles.content}>
          <View style={styles.modesContainer}>
            {modes.map((mode) => (
              <View
                key={mode.key}
                style={[styles.modeCard, styles.modeDisabled]}
              >
                <Text style={styles.modeIcon}>{mode.icon}</Text>
                <View style={styles.modeTextBlock}>
                  <Text style={[styles.modeTitle, styles.modeTitleDisabled]}>
                    {mode.title}
                  </Text>
                  <Text style={styles.modeSubtitle}>{mode.subtitle}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
        </ScreenContainer>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenContainer>
      <View style={styles.headerBlock}>
        <Text style={styles.screenTitle}>Learn</Text>
        <Text style={styles.screenOrnament}>{ornament}</Text>
      </View>

      {availableTags.length > 0 && (
        <View style={styles.tagRow}>
          <TagDropdown
            tags={availableTags}
            selectedTag={selectedTag}
            onSelectTag={setSelectedTag}
          />
          {selectedTag && (
            <Text style={styles.tagLabel}>studying: {selectedTag}</Text>
          )}
        </View>
      )}

      {error ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : loading ? (
        <View style={styles.centered}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      ) : (
        <View style={styles.content}>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.streak}</Text>
              <Text style={styles.statLabel}>Streak</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.mastered}</Text>
              <Text style={styles.statLabel}>Mastered</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.due}</Text>
              <Text style={styles.statLabel}>Due</Text>
            </View>
          </View>

          <View style={styles.modesContainer}>
            {modes.map((mode) => (
              <TouchableOpacity
                key={mode.key}
                style={[styles.modeCard, !mode.enabled && styles.modeDisabled]}
                onPress={mode.onPress}
                disabled={!mode.enabled}
                activeOpacity={0.7}
              >
                <Text style={styles.modeIcon}>{mode.icon}</Text>
                <View style={styles.modeTextBlock}>
                  <Text
                    style={[
                      styles.modeTitle,
                      !mode.enabled && styles.modeTitleDisabled,
                    ]}
                  >
                    {mode.title}
                  </Text>
                  <Text style={styles.modeSubtitle}>
                    {mode.enabled
                      ? mode.subtitle
                      : `Save ${mode.minWords}+ words to unlock`}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
      </ScreenContainer>
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
  tagRow: {
    alignItems: "center",
    marginBottom: 4,
  },
  tagLabel: {
    color: colors.amberMuted,
    fontSize: 11,
    fontFamily: fonts.body,
    fontStyle: "italic",
    marginTop: 6,
    letterSpacing: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    marginBottom: 24,
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.obsidian,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.charcoal,
    paddingVertical: 14,
    alignItems: "center",
  },
  statValue: {
    color: colors.ember,
    fontSize: 24,
    fontFamily: fonts.display,
    fontWeight: "300",
  },
  statLabel: {
    color: colors.ash,
    fontSize: 10,
    fontFamily: fonts.body,
    letterSpacing: 2,
    textTransform: "uppercase",
    marginTop: 4,
  },
  modesContainer: {
    gap: 12,
  },
  modeCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.obsidian,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.charcoal,
    padding: 18,
  },
  modeDisabled: {
    opacity: 0.4,
  },
  modeIcon: {
    fontSize: 28,
    marginRight: 16,
  },
  modeTextBlock: {
    flex: 1,
  },
  modeTitle: {
    color: colors.bone,
    fontSize: 16,
    fontFamily: fonts.body,
    fontWeight: "400",
    letterSpacing: 1,
  },
  modeTitleDisabled: {
    color: colors.ghost,
  },
  modeSubtitle: {
    color: colors.ash,
    fontSize: 12,
    fontFamily: fonts.body,
    marginTop: 3,
    fontStyle: "italic",
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: {
    color: colors.bloodBright,
    fontFamily: fonts.body,
  },
  loadingText: {
    color: colors.ash,
    fontFamily: fonts.body,
    fontStyle: "italic",
  },
});
