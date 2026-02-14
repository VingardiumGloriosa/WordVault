import { useState, useRef, useCallback } from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
} from "react-native";
import { Text, Button } from "@rneui/themed";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../../auth/AuthProvider";
import { useLearnStore } from "../../store/learnStore";
import { reviewCard } from "../../lib/spacedRepetition";
import {
  updateWordProgress,
  saveLearningSession,
  SavedWordWithProgress,
} from "../../lib/learningProgress";
import { colors, ornament } from "../../theme";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function FlashcardsScreen() {
  const { session } = useAuth();
  const navigation = useNavigation();
  const { words } = useLearnStore();

  // Sort: due words first, then by soonest next_review_at
  const sortedWords = useRef(
    [...words].sort((a, b) => {
      const now = Date.now();
      const aTime = a.progress
        ? new Date(a.progress.next_review_at).getTime()
        : 0;
      const bTime = b.progress
        ? new Date(b.progress.next_review_at).getTime()
        : 0;
      const aDue = aTime <= now ? 0 : 1;
      const bDue = bTime <= now ? 0 : 1;
      if (aDue !== bDue) return aDue - bDue;
      return aTime - bTime;
    }),
  ).current;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [done, setDone] = useState(false);

  const flipAnim = useRef(new Animated.Value(0)).current;

  const flipCard = useCallback(() => {
    Animated.spring(flipAnim, {
      toValue: isFlipped ? 0 : 1,
      friction: 8,
      tension: 10,
      useNativeDriver: Platform.OS !== "web",
    }).start();
    setIsFlipped(!isFlipped);
  }, [isFlipped, flipAnim]);

  const resetFlip = useCallback(() => {
    flipAnim.setValue(0);
    setIsFlipped(false);
  }, [flipAnim]);

  const handleGrade = useCallback(
    async (quality: number) => {
      const word = sortedWords[currentIndex];
      if (!session || !word.progress) return;

      const correct = quality >= 3;
      if (correct) setCorrectCount((c) => c + 1);

      const result = reviewCard(
        {
          easinessFactor: word.progress.easiness_factor,
          interval: word.progress.interval,
          repetitions: word.progress.repetitions,
        },
        quality,
      );

      try {
        await updateWordProgress(
          session.user.id,
          word.id,
          result,
          correct,
        );
      } catch {
        // Non-blocking — progress still shown locally
      }

      if (currentIndex + 1 >= sortedWords.length) {
        // End of deck
        setDone(true);
        const finalCorrect = correct ? correctCount + 1 : correctCount;
        try {
          await saveLearningSession(
            session.user.id,
            "flashcard",
            sortedWords.length,
            finalCorrect,
          );
        } catch {
          // Non-blocking
        }
      } else {
        resetFlip();
        setCurrentIndex((i) => i + 1);
      }
    },
    [currentIndex, session, sortedWords, correctCount, resetFlip],
  );

  const frontInterpolate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });
  const backInterpolate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["180deg", "360deg"],
  });

  if (done) {
    const total = sortedWords.length;
    const pct = total > 0 ? Math.round((correctCount / total) * 100) : 0;

    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <Text style={styles.summaryTitle}>Session Complete</Text>
          <Text style={styles.screenOrnament}>{ornament}</Text>
          <Text style={styles.summaryValue}>
            {correctCount} / {total}
          </Text>
          <Text style={styles.summaryLabel}>{pct}% recalled</Text>
          <Button
            title="Back to Learn"
            type="outline"
            onPress={() => navigation.goBack()}
            buttonStyle={styles.backButton}
            titleStyle={styles.backButtonTitle}
            containerStyle={{ marginTop: 32 }}
          />
        </View>
      </SafeAreaView>
    );
  }

  const currentWord = sortedWords[currentIndex];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>{"\u2190"}</Text>
        </TouchableOpacity>
        <Text style={styles.progress}>
          {currentIndex + 1} / {sortedWords.length}
        </Text>
      </View>

      <View style={styles.cardContainer}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={flipCard}
          style={styles.cardTouchable}
        >
          <Animated.View
            style={[
              styles.card,
              { transform: [{ rotateY: frontInterpolate }] },
              styles.cardFace,
            ]}
          >
            <Text style={styles.cardLabel}>WORD</Text>
            <Text style={styles.cardWord}>{currentWord.word}</Text>
            <Text style={styles.tapHint}>tap to flip</Text>
          </Animated.View>

          <Animated.View
            style={[
              styles.card,
              styles.cardBack,
              { transform: [{ rotateY: backInterpolate }] },
              styles.cardFace,
            ]}
          >
            <Text style={styles.cardLabel}>DEFINITION</Text>
            <Text style={styles.cardPartOfSpeech}>
              {currentWord.part_of_speech}
            </Text>
            <Text style={styles.cardDefinition}>
              {currentWord.definition}
            </Text>
          </Animated.View>
        </TouchableOpacity>
      </View>

      <View style={styles.gradeRow}>
        <TouchableOpacity
          style={[styles.gradeButton, styles.gradeButtonWrong]}
          onPress={() => handleGrade(1)}
        >
          <Text style={styles.gradeButtonText}>Still Learning</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.gradeButton, styles.gradeButtonRight]}
          onPress={() => handleGrade(4)}
        >
          <Text style={styles.gradeButtonText}>Got It</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.void,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
  },
  backArrow: {
    color: colors.bone,
    fontSize: 22,
  },
  progress: {
    color: colors.ash,
    fontSize: 13,
    letterSpacing: 2,
  },
  cardContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  cardTouchable: {
    width: SCREEN_WIDTH - 48,
    height: 260,
  },
  cardFace: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backfaceVisibility: "hidden",
  },
  card: {
    backgroundColor: colors.obsidian,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.charcoal,
    padding: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  cardBack: {
    backgroundColor: colors.smoke,
  },
  cardLabel: {
    color: colors.ghost,
    fontSize: 10,
    letterSpacing: 3,
    textTransform: "uppercase",
    marginBottom: 16,
  },
  cardWord: {
    color: colors.bone,
    fontSize: 32,
    fontWeight: "300",
    letterSpacing: 1,
  },
  tapHint: {
    color: colors.faded,
    fontSize: 11,
    fontStyle: "italic",
    marginTop: 20,
  },
  cardPartOfSpeech: {
    color: colors.wineLight,
    fontSize: 12,
    fontStyle: "italic",
    letterSpacing: 1,
    marginBottom: 12,
  },
  cardDefinition: {
    color: colors.parchment,
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
  },
  gradeRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 12,
  },
  gradeButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  gradeButtonWrong: {
    backgroundColor: colors.burgundy,
  },
  gradeButtonRight: {
    backgroundColor: colors.success,
  },
  gradeButtonText: {
    color: colors.bone,
    fontSize: 14,
    fontWeight: "500",
    letterSpacing: 1,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  summaryTitle: {
    color: colors.bone,
    fontSize: 20,
    fontWeight: "300",
    letterSpacing: 2,
    marginBottom: 8,
  },
  screenOrnament: {
    color: colors.faded,
    fontSize: 12,
    letterSpacing: 6,
    marginBottom: 24,
  },
  summaryValue: {
    color: colors.ember,
    fontSize: 36,
    fontWeight: "300",
  },
  summaryLabel: {
    color: colors.ash,
    fontSize: 14,
    fontStyle: "italic",
    marginTop: 4,
  },
  backButton: {
    borderColor: colors.charcoal,
    borderRadius: 10,
    paddingHorizontal: 24,
  },
  backButtonTitle: {
    color: colors.bone,
    fontSize: 13,
    letterSpacing: 1,
  },
});
