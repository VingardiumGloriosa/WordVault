import { useState, useCallback, useRef, useEffect } from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Animated,
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
import { pulseAnimation, shakeAnimation } from "../../lib/animations";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

type Question = {
  word: SavedWordWithProgress;
  options: string[];
  correctIndex: number;
};

function buildQuestions(words: SavedWordWithProgress[]): Question[] {
  const pool = shuffle(words).slice(0, 10);

  return pool.map((w) => {
    const others = shuffle(words.filter((o) => o.id !== w.id));
    // Use unique definitions as distractors, avoiding duplicates of the correct answer
    const seen = new Set([w.definition]);
    const distractors: string[] = [];
    for (const o of others) {
      if (distractors.length >= 3) break;
      if (!seen.has(o.definition)) {
        seen.add(o.definition);
        distractors.push(o.definition);
      }
    }

    const options = shuffle([w.definition, ...distractors]);
    const correctIndex = options.indexOf(w.definition);

    return { word: w, options, correctIndex };
  });
}

export default function QuizScreen() {
  const { session } = useAuth();
  const navigation = useNavigation();
  const route = useRoute<RouteProp<LearnStackParamList, "Quiz">>();
  const { words, selectedTag, loadWords } = useLearnStore();
  const routeTag = route.params?.tag;

  useEffect(() => {
    if (routeTag !== undefined && routeTag !== selectedTag && session) {
      loadWords(session.user.id, routeTag);
    }
  }, []);

  if (words.length < 4) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScreenContainer>
          <View style={styles.centered}>
            <Text style={styles.summaryTitle}>Not Enough Words</Text>
            <Text style={styles.screenOrnament}>{ornament}</Text>
            <Text style={styles.summaryLabel}>
              Save at least 4 words to take a quiz.
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

  const questionsRef = useRef(buildQuestions(words));
  const questions = questionsRef.current;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [done, setDone] = useState(false);
  const [missedWordIds] = useState(() => new Set<string>());
  const optionAnims = useRef(questions.map(() => new Animated.Value(1))).current;
  const shakeAnims = useRef(questions.map(() => new Animated.Value(0))).current;

  const handleSelect = useCallback(
    async (optionIndex: number) => {
      if (selected !== null) return;
      setSelected(optionIndex);

      const q = questions[currentIndex];
      const correct = optionIndex === q.correctIndex;
      const quality = correct ? 5 : 1;
      if (correct) setCorrectCount((c) => c + 1);
      if (!correct) missedWordIds.add(q.word.id);

      // Animate feedback
      if (correct) {
        pulseAnimation(optionAnims[currentIndex]).start();
      } else {
        shakeAnimation(shakeAnims[currentIndex]).start();
      }

      if (session && q.word.progress) {
        const result = reviewCard(
          {
            easinessFactor: q.word.progress.easiness_factor,
            interval: q.word.progress.interval,
            repetitions: q.word.progress.repetitions,
          },
          quality,
        );
        try {
          await updateWordProgress(
            session.user.id,
            q.word.id,
            result,
            correct,
          );
        } catch {
          // Non-blocking
        }
      }
    },
    [selected, currentIndex, questions, session, missedWordIds],
  );

  const handleNext = useCallback(() => {
    if (currentIndex + 1 >= questions.length) {
      setDone(true);
      const correct = selected === questions[currentIndex].correctIndex;
      const finalCorrect = correct ? correctCount + 1 : correctCount;
      if (session) {
        saveLearningSession(
          session.user.id,
          "quiz",
          questions.length,
          finalCorrect,
        ).catch(() => {});
      }
    } else {
      setSelected(null);
      setCurrentIndex((i) => i + 1);
    }
  }, [currentIndex, questions, session, correctCount, selected]);

  useKeyboardShortcut("1", useCallback(() => { if (selected === null && questions[currentIndex]?.options[0]) handleSelect(0); }, [selected, currentIndex, questions, handleSelect]));
  useKeyboardShortcut("2", useCallback(() => { if (selected === null && questions[currentIndex]?.options[1]) handleSelect(1); }, [selected, currentIndex, questions, handleSelect]));
  useKeyboardShortcut("3", useCallback(() => { if (selected === null && questions[currentIndex]?.options[2]) handleSelect(2); }, [selected, currentIndex, questions, handleSelect]));
  useKeyboardShortcut("4", useCallback(() => { if (selected === null && questions[currentIndex]?.options[3]) handleSelect(3); }, [selected, currentIndex, questions, handleSelect]));
  useKeyboardShortcut("Enter", useCallback(() => { if (selected !== null) handleNext(); }, [selected, handleNext]));
  useKeyboardShortcut(" ", useCallback(() => { if (selected !== null) handleNext(); }, [selected, handleNext]));

  const handlePlayAgain = useCallback(() => {
    questionsRef.current = buildQuestions(words);
    setCurrentIndex(0);
    setSelected(null);
    setCorrectCount(0);
    setDone(false);
    missedWordIds.clear();
  }, [words, missedWordIds]);

  const handleReviewMissed = useCallback(() => {
    const missed = words.filter((w) => missedWordIds.has(w.id));
    if (missed.length < 4) return;
    questionsRef.current = buildQuestions(missed);
    setCurrentIndex(0);
    setSelected(null);
    setCorrectCount(0);
    setDone(false);
    missedWordIds.clear();
  }, [words, missedWordIds]);

  if (done) {
    const total = questions.length;
    const pct = total > 0 ? Math.round((correctCount / total) * 100) : 0;
    const msg = getSessionMessage(pct);
    const canReviewMissed = missedWordIds.size >= 4;

    return (
      <SafeAreaView style={styles.safeArea}>
        <ScreenContainer>
        <View style={styles.centered}>
          <Text style={styles.summaryTitle}>{msg.title}</Text>
          <Text style={styles.screenOrnament}>{ornament}</Text>
          <Text style={styles.summaryValue}>
            {correctCount} / {total}
          </Text>
          <Text style={styles.summaryLabel}>{pct}% correct</Text>
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

  const q = questions[currentIndex];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenContainer>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} accessibilityLabel="Go back" accessibilityRole="button">
          <Text style={styles.backArrow}>{"\u2190"}</Text>
        </TouchableOpacity>
        <Text style={styles.progress}>
          {currentIndex + 1} / {questions.length}
        </Text>
      </View>

      <View style={styles.questionBlock}>
        <Text style={styles.questionLabel}>What does this word mean?</Text>
        <Text style={styles.questionWord}>{q.word.word}</Text>
      </View>

      <View style={styles.optionsContainer}>
        {q.options.map((opt, i) => {
          let optStyle = styles.option;
          if (selected !== null) {
            if (i === q.correctIndex) {
              optStyle = { ...styles.option, ...styles.optionCorrect };
            } else if (i === selected) {
              optStyle = { ...styles.option, ...styles.optionWrong };
            }
          }

          const isCorrectOpt = selected !== null && i === q.correctIndex;
          const isWrongOpt = selected !== null && i === selected && i !== q.correctIndex;

          return (
            <Animated.View
              key={i}
              style={{
                transform: [
                  { scale: isCorrectOpt ? optionAnims[currentIndex] : 1 },
                  { translateX: isWrongOpt ? shakeAnims[currentIndex] : 0 },
                ],
              }}
            >
              <TouchableOpacity
                style={optStyle}
                onPress={() => handleSelect(i)}
                disabled={selected !== null}
                activeOpacity={0.7}
              >
                <Text style={styles.optionText}>{opt}</Text>
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </View>

      {selected !== null && (
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>
            {currentIndex + 1 >= questions.length ? "See Results" : "Next"}
          </Text>
        </TouchableOpacity>
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
  questionBlock: {
    alignItems: "center",
    paddingTop: 40,
    paddingBottom: 32,
    paddingHorizontal: 24,
  },
  questionLabel: {
    color: colors.ash,
    fontSize: 13,
    fontFamily: fonts.body,
    fontStyle: "italic",
    letterSpacing: 1,
    marginBottom: 16,
  },
  questionWord: {
    color: colors.bone,
    fontSize: 32,
    fontFamily: fonts.display,
    fontWeight: "300",
    letterSpacing: 1,
  },
  optionsContainer: {
    paddingHorizontal: 20,
    gap: 10,
  },
  option: {
    backgroundColor: colors.obsidian,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.charcoal,
    padding: 16,
  },
  optionCorrect: {
    borderColor: colors.success,
    backgroundColor: colors.successBg,
  },
  optionWrong: {
    borderColor: colors.blood,
    backgroundColor: colors.errorBg,
  },
  optionText: {
    color: colors.parchment,
    fontSize: 14,
    fontFamily: fonts.body,
    lineHeight: 20,
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
  nextButton: {
    backgroundColor: colors.wine,
    borderRadius: 12,
    paddingVertical: 14,
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 24,
    alignItems: "center",
  },
  nextButtonText: {
    color: colors.bone,
    fontSize: 14,
    fontFamily: fonts.body,
    fontWeight: "400",
    letterSpacing: 2,
    textTransform: "uppercase",
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
