import { useState, useRef, useCallback, useEffect } from "react";
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
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { useAuth } from "../../auth/AuthProvider";
import { useLearnStore } from "../../store/learnStore";
import { LearnStackParamList } from "../../navigation/LearnStack";
import { reviewCard } from "../../lib/spacedRepetition";
import {
  updateWordProgress,
  saveLearningSession,
  SavedWordWithProgress,
} from "../../lib/learningProgress";
import { colors, fonts, ornament } from "../../theme";
import ScreenContainer from "../../components/ScreenContainer";
import { getSessionMessage } from "../../lib/sessionMessages";
import { useKeyboardShortcut } from "../../lib/useKeyboardShortcut";

const SCREEN_WIDTH = Math.min(Dimensions.get("window").width, 480);

export default function FlashcardsScreen() {
  const { session } = useAuth();
  const navigation = useNavigation();
  const route = useRoute<RouteProp<LearnStackParamList, "Flashcards">>();
  const { words, selectedTag, loadWords } = useLearnStore();
  const routeTag = route.params?.tag;

  // If route tag differs from store tag, reload
  useEffect(() => {
    if (routeTag !== undefined && routeTag !== selectedTag && session) {
      loadWords(session.user.id, routeTag);
    }
  }, []);

  if (words.length < 1) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScreenContainer>
          <View style={styles.centered}>
            <Text style={styles.summaryTitle}>Not Enough Words</Text>
            <Text style={styles.screenOrnament}>{ornament}</Text>
            <Text style={styles.summaryLabel}>
              Save at least 1 word to use flashcards.
            </Text>
            <Button
              title="Go Back"
              type="outline"
              onPress={() => navigation.goBack()}
              buttonStyle={styles.backButton}
              titleStyle={styles.backButtonTitle}
              containerStyle={{ marginTop: 32 }}
            />
          </View>
        </ScreenContainer>
      </SafeAreaView>
    );
  }

  // Sort: due words first, then by soonest next_review_at
  // Re-sort when words change (e.g. new words added from another screen)
  const sortedWords = useRef<SavedWordWithProgress[]>([]);
  const lastWordIds = useRef("");
  const currentIds = words.map((w) => w.id).join(",");
  if (currentIds !== lastWordIds.current) {
    lastWordIds.current = currentIds;
    const now = Date.now();
    sortedWords.current = [...words].sort((a, b) => {
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
    });
  }

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [done, setDone] = useState(false);
  const [missedWordIds] = useState(() => new Set<string>());

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

  useKeyboardShortcut(" ", flipCard);

  const handleGrade = useCallback(
    async (quality: number) => {
      const word = sortedWords.current[currentIndex];
      if (!session || !word.progress) return;

      const correct = quality >= 3;
      if (correct) setCorrectCount((c) => c + 1);
      if (!correct) missedWordIds.add(word.id);

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

      if (currentIndex + 1 >= sortedWords.current.length) {
        // End of deck
        setDone(true);
        const finalCorrect = correct ? correctCount + 1 : correctCount;
        try {
          await saveLearningSession(
            session.user.id,
            "flashcard",
            sortedWords.current.length,
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
    [currentIndex, session, correctCount, resetFlip],
  );

  const frontInterpolate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });
  const backInterpolate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["180deg", "360deg"],
  });

  const handlePlayAgain = useCallback(() => {
    const now = Date.now();
    sortedWords.current = [...words].sort((a, b) => {
      const aTime = a.progress ? new Date(a.progress.next_review_at).getTime() : 0;
      const bTime = b.progress ? new Date(b.progress.next_review_at).getTime() : 0;
      const aDue = aTime <= now ? 0 : 1;
      const bDue = bTime <= now ? 0 : 1;
      if (aDue !== bDue) return aDue - bDue;
      return aTime - bTime;
    });
    resetFlip();
    setCurrentIndex(0);
    setCorrectCount(0);
    setDone(false);
    missedWordIds.clear();
  }, [words, resetFlip, missedWordIds]);

  const handleReviewMissed = useCallback(() => {
    const missed = words.filter((w) => missedWordIds.has(w.id));
    if (missed.length < 1) return;
    sortedWords.current = missed;
    resetFlip();
    setCurrentIndex(0);
    setCorrectCount(0);
    setDone(false);
    missedWordIds.clear();
  }, [words, missedWordIds, resetFlip]);

  if (done) {
    const total = sortedWords.current.length;
    const pct = total > 0 ? Math.round((correctCount / total) * 100) : 0;
    const msg = getSessionMessage(pct);
    const canReviewMissed = missedWordIds.size >= 1;

    return (
      <SafeAreaView style={styles.safeArea}>
        <ScreenContainer>
        <View style={styles.centered}>
          <Text style={styles.summaryTitle}>{msg.title}</Text>
          <Text style={styles.screenOrnament}>{ornament}</Text>
          <Text style={styles.summaryValue}>
            {correctCount} / {total}
          </Text>
          <Text style={styles.summaryLabel}>{pct}% recalled</Text>
          <Text style={styles.summarySubtitle}>{msg.subtitle}</Text>
          <View style={styles.completionButtons}>
            <Button
              title="Play Again"
              onPress={handlePlayAgain}
              buttonStyle={styles.playAgainButton}
              titleStyle={styles.playAgainButtonTitle}
            />
            {canReviewMissed && (
              <Button
                title="Review Missed"
                onPress={handleReviewMissed}
                buttonStyle={styles.reviewMissedButton}
                titleStyle={styles.playAgainButtonTitle}
              />
            )}
            <Button
              title="Back to Learn"
              type="outline"
              onPress={() => navigation.goBack()}
              buttonStyle={styles.backButton}
              titleStyle={styles.backButtonTitle}
            />
          </View>
        </View>
        </ScreenContainer>
      </SafeAreaView>
    );
  }

  const currentWord = sortedWords.current[currentIndex];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenContainer>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} accessibilityLabel="Go back" accessibilityRole="button">
          <Text style={styles.backArrow}>{"\u2190"}</Text>
        </TouchableOpacity>
        <Text style={styles.progress}>
          {currentIndex + 1} / {sortedWords.current.length}
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
          style={[styles.gradeButton, styles.gradeButtonForgot]}
          onPress={() => handleGrade(1)}
        >
          <Text style={styles.gradeButtonText}>Forgot</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.gradeButton, styles.gradeButtonHard]}
          onPress={() => handleGrade(3)}
        >
          <Text style={styles.gradeButtonText}>Hard</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.gradeButton, styles.gradeButtonEasy]}
          onPress={() => handleGrade(5)}
        >
          <Text style={styles.gradeButtonText}>Easy</Text>
        </TouchableOpacity>
      </View>
      </ScreenContainer>
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
    fontFamily: fonts.body,
  },
  progress: {
    color: colors.ash,
    fontSize: 13,
    fontFamily: fonts.body,
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
    fontFamily: fonts.body,
    letterSpacing: 3,
    textTransform: "uppercase",
    marginBottom: 16,
  },
  cardWord: {
    color: colors.bone,
    fontSize: 32,
    fontFamily: fonts.display,
    fontWeight: "300",
    letterSpacing: 1,
  },
  tapHint: {
    color: colors.faded,
    fontSize: 11,
    fontFamily: fonts.body,
    fontStyle: "italic",
    marginTop: 20,
  },
  cardPartOfSpeech: {
    color: colors.wineLight,
    fontSize: 12,
    fontFamily: fonts.body,
    fontStyle: "italic",
    letterSpacing: 1,
    marginBottom: 12,
  },
  cardDefinition: {
    color: colors.parchment,
    fontSize: 16,
    fontFamily: fonts.body,
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
  gradeButtonForgot: {
    backgroundColor: colors.burgundy,
  },
  gradeButtonHard: {
    backgroundColor: colors.amberMuted,
  },
  gradeButtonEasy: {
    backgroundColor: colors.success,
  },
  gradeButtonText: {
    color: colors.bone,
    fontSize: 14,
    fontFamily: fonts.body,
    fontWeight: "400",
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
    fontFamily: fonts.display,
    fontWeight: "300",
    letterSpacing: 2,
    marginBottom: 8,
  },
  screenOrnament: {
    color: colors.faded,
    fontSize: 12,
    fontFamily: fonts.body,
    letterSpacing: 6,
    marginBottom: 24,
  },
  summaryValue: {
    color: colors.ember,
    fontSize: 36,
    fontFamily: fonts.display,
    fontWeight: "300",
  },
  summaryLabel: {
    color: colors.ash,
    fontSize: 14,
    fontFamily: fonts.body,
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
    fontFamily: fonts.body,
    letterSpacing: 1,
  },
  summarySubtitle: {
    color: colors.ghost,
    fontSize: 13,
    fontFamily: fonts.body,
    fontStyle: "italic",
    marginTop: 12,
  },
  completionButtons: {
    marginTop: 28,
    gap: 12,
    width: "100%",
    paddingHorizontal: 16,
  },
  playAgainButton: {
    backgroundColor: colors.wine,
    borderRadius: 10,
    paddingHorizontal: 24,
  },
  playAgainButtonTitle: {
    color: colors.bone,
    fontSize: 13,
    fontFamily: fonts.body,
    letterSpacing: 1,
  },
  reviewMissedButton: {
    backgroundColor: colors.amberMuted,
    borderRadius: 10,
    paddingHorizontal: 24,
  },
});
