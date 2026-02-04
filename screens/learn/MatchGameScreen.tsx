import { useState, useRef, useCallback } from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
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
const TILE_GAP = 8;
const TILE_WIDTH = (SCREEN_WIDTH - 40 - TILE_GAP * 2) / 3;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

type Tile = {
  id: string;
  pairId: string;
  text: string;
  type: "word" | "definition";
};

function buildTiles(words: SavedWordWithProgress[]): Tile[] {
  const picked = shuffle(words).slice(0, 6);
  const tiles: Tile[] = [];

  for (const w of picked) {
    tiles.push({ id: `w-${w.id}`, pairId: w.id, text: w.word, type: "word" });
    tiles.push({
      id: `d-${w.id}`,
      pairId: w.id,
      text: w.definition.length > 60
        ? w.definition.slice(0, 57) + "..."
        : w.definition,
      type: "definition",
    });
  }

  return shuffle(tiles);
}

export default function MatchGameScreen() {
  const { session } = useAuth();
  const navigation = useNavigation();
  const { words } = useLearnStore();

  const tiles = useRef(buildTiles(words)).current;
  const wordMap = useRef(
    new Map(words.map((w) => [w.id, w])),
  ).current;

  const [selected, setSelected] = useState<string | null>(null);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [wrong, setWrong] = useState<Set<string>>(new Set());
  const [attempts, setAttempts] = useState<Map<string, number>>(new Map());
  const [startTime] = useState(Date.now());
  const [elapsed, setElapsed] = useState(0);
  const [done, setDone] = useState(false);

  // Timer
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  if (!timerRef.current && !done) {
    timerRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
  }

  const finishGame = useCallback(
    async (finalAttempts: Map<string, number>) => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      const duration = Math.floor((Date.now() - startTime) / 1000);
      setElapsed(duration);
      setDone(true);

      if (!session) return;

      // Update SM-2 for each matched word
      const pairIds = new Set(tiles.map((t) => t.pairId));
      let wordsCorrect = 0;

      for (const pairId of pairIds) {
        const w = wordMap.get(pairId);
        if (!w?.progress) continue;

        const tryCount = finalAttempts.get(pairId) ?? 1;
        const quality = tryCount === 1 ? 5 : 3;
        if (tryCount === 1) wordsCorrect++;

        const result = reviewCard(
          {
            easinessFactor: w.progress.easiness_factor,
            interval: w.progress.interval,
            repetitions: w.progress.repetitions,
          },
          quality,
        );

        try {
          await updateWordProgress(
            session.user.id,
            w.id,
            result,
            quality >= 3,
          );
        } catch {
          // Non-blocking
        }
      }

      try {
        await saveLearningSession(
          session.user.id,
          "match",
          pairIds.size,
          wordsCorrect,
          duration,
        );
      } catch {
        // Non-blocking
      }
    },
    [session, tiles, wordMap, startTime],
  );

  const handleTileTap = useCallback(
    (tileId: string) => {
      if (matched.has(tileId) || wrong.has(tileId)) return;

      const tile = tiles.find((t) => t.id === tileId);
      if (!tile) return;

      if (!selected) {
        setSelected(tileId);
        return;
      }

      if (selected === tileId) {
        setSelected(null);
        return;
      }

      const firstTile = tiles.find((t) => t.id === selected);
      if (!firstTile) return;

      if (firstTile.pairId === tile.pairId && firstTile.type !== tile.type) {
        // Match!
        const newMatched = new Set(matched);
        newMatched.add(selected);
        newMatched.add(tileId);
        setMatched(newMatched);
        setSelected(null);

        // Track attempts for this pair
        const currentAttempts = new Map(attempts);
        currentAttempts.set(
          tile.pairId,
          (currentAttempts.get(tile.pairId) ?? 0) + 1,
        );
        setAttempts(currentAttempts);

        // Check if all matched
        if (newMatched.size === tiles.length) {
          finishGame(currentAttempts);
        }
      } else {
        // Wrong pair
        const wrongSet = new Set([selected, tileId]);
        setWrong(wrongSet);

        // Track attempt
        const currentAttempts = new Map(attempts);
        currentAttempts.set(
          firstTile.pairId,
          (currentAttempts.get(firstTile.pairId) ?? 0) + 1,
        );
        setAttempts(currentAttempts);

        setTimeout(() => {
          setWrong(new Set());
          setSelected(null);
        }, 600);
      }
    },
    [selected, matched, wrong, tiles, attempts, finishGame],
  );

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  if (done) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <Text style={styles.summaryTitle}>Match Complete</Text>
          <Text style={styles.screenOrnament}>{ornament}</Text>
          <Text style={styles.summaryValue}>{formatTime(elapsed)}</Text>
          <Text style={styles.summaryLabel}>time elapsed</Text>
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>{"\u2190"}</Text>
        </TouchableOpacity>
        <Text style={styles.timer}>{formatTime(elapsed)}</Text>
      </View>

      <View style={styles.gridContainer}>
        <View style={styles.grid}>
          {tiles.map((tile) => {
            const isSelected = selected === tile.id;
            const isMatched = matched.has(tile.id);
            const isWrong = wrong.has(tile.id);

            return (
              <TouchableOpacity
                key={tile.id}
                style={[
                  styles.tile,
                  isSelected && styles.tileSelected,
                  isMatched && styles.tileMatched,
                  isWrong && styles.tileWrong,
                ]}
                onPress={() => handleTileTap(tile.id)}
                disabled={isMatched}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    tile.type === "word"
                      ? styles.tileWordText
                      : styles.tileDefText,
                    isMatched && styles.tileTextMatched,
                  ]}
                  numberOfLines={4}
                >
                  {tile.text}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
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
  timer: {
    color: colors.ember,
    fontSize: 16,
    fontWeight: "300",
    letterSpacing: 2,
  },
  gridContainer: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: TILE_GAP,
  },
  tile: {
    width: TILE_WIDTH,
    height: TILE_WIDTH * 0.9,
    backgroundColor: colors.obsidian,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.charcoal,
    justifyContent: "center",
    alignItems: "center",
    padding: 8,
  },
  tileSelected: {
    borderColor: colors.ember,
    borderWidth: 2,
  },
  tileMatched: {
    borderColor: colors.success,
    backgroundColor: "#1a2a15",
  },
  tileWrong: {
    borderColor: colors.blood,
    backgroundColor: "#2a1515",
  },
  tileWordText: {
    color: colors.bone,
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
  },
  tileDefText: {
    color: colors.parchment,
    fontSize: 10,
    textAlign: "center",
    lineHeight: 14,
  },
  tileTextMatched: {
    opacity: 0.5,
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
