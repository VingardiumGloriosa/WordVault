import { useState, useCallback, useRef, useEffect } from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
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
    const distractors = shuffle(
      words.filter((o) => o.id !== w.id),
    )
      .slice(0, 3)
      .map((o) => o.definition);

    const options = shuffle([w.definition, ...distractors]);
    const correctIndex = options.indexOf(w.definition);

    return { word: w, options, correctIndex };
  });
}

export default function QuizScreen() {
  const { session } = useAuth();
  const navigation = useNavigation();
  const { words } = useLearnStore();

  const questions = useRef(buildQuestions(words)).current;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [done, setDone] = useState(false);

  const handleSelect = useCallback(
    async (optionIndex: number) => {
      if (selected !== null) return; // Already answered
      setSelected(optionIndex);

      const q = questions[currentIndex];
      const correct = optionIndex === q.correctIndex;
      const quality = correct ? 5 : 1;
      if (correct) setCorrectCount((c) => c + 1);

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

      // Auto-advance after delay
      setTimeout(() => {
        if (currentIndex + 1 >= questions.length) {
          setDone(true);
          const finalCorrect = correct
            ? correctCount + 1
            : correctCount;
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
      }, 1200);
    },
    [selected, currentIndex, questions, session, correctCount],
  );

  if (done) {
    const total = questions.length;
    const pct = total > 0 ? Math.round((correctCount / total) * 100) : 0;

    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <Text style={styles.summaryTitle}>Quiz Complete</Text>
          <Text style={styles.screenOrnament}>{ornament}</Text>
          <Text style={styles.summaryValue}>
            {correctCount} / {total}
          </Text>
          <Text style={styles.summaryLabel}>{pct}% correct</Text>
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

  const q = questions[currentIndex];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
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

          return (
            <TouchableOpacity
              key={i}
              style={optStyle}
              onPress={() => handleSelect(i)}
              disabled={selected !== null}
              activeOpacity={0.7}
            >
              <Text style={styles.optionText}>{opt}</Text>
            </TouchableOpacity>
          );
        })}
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
  questionBlock: {
    alignItems: "center",
    paddingTop: 40,
    paddingBottom: 32,
    paddingHorizontal: 24,
  },
  questionLabel: {
    color: colors.ash,
    fontSize: 13,
    fontStyle: "italic",
    letterSpacing: 1,
    marginBottom: 16,
  },
  questionWord: {
    color: colors.bone,
    fontSize: 32,
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
    backgroundColor: "#1a2a15",
  },
  optionWrong: {
    borderColor: colors.blood,
    backgroundColor: "#2a1515",
  },
  optionText: {
    color: colors.parchment,
    fontSize: 14,
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
