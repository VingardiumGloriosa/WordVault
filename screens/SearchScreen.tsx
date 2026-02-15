import { View, Alert, StyleSheet, ScrollView, SafeAreaView } from "react-native";
import { Input, Text, Button } from "@rneui/themed";
import { useNavigation } from "@react-navigation/native";
import { useDictionaryStore } from "../store/dictionaryStore";
import { useAuth } from "../auth/AuthProvider";
import { colors, ornament } from "../theme";

export default function SearchScreen() {
  const { search, result, loading, error, saveCurrentWord } =
    useDictionaryStore();
  const { session } = useAuth();
  const navigation = useNavigation<any>();

  const entry = result?.[0];

  const handleSave = async () => {
    if (!session || !entry) return;
    try {
      await saveCurrentWord(entry, session.user.id);
      Alert.alert("Saved", `"${entry.word}" has been added to your collection.`);
    } catch (err) {
      if (err instanceof Error) {
        Alert.alert("Save Failed", err.message);
      }
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.screenTitle}>Search</Text>
        <Text style={styles.screenOrnament}>{ornament}</Text>

        <View style={styles.searchWrap}>
          <Input
            placeholder="enter a word..."
            placeholderTextColor={colors.ghost}
            onSubmitEditing={(e) => search(e.nativeEvent.text)}
            returnKeyType="search"
            leftIcon={{ name: "search", type: "material", color: colors.amberMuted, size: 18 }}
            containerStyle={styles.searchContainer}
            inputStyle={styles.inputText}
            inputContainerStyle={styles.inputInner}
          />
        </View>

        {loading && (
          <Text style={styles.loadingText}>consulting the lexicon...</Text>
        )}

        {error && <Text style={styles.error}>{error}</Text>}

        {entry && (
          <View style={styles.resultCard}>
            <View style={styles.wordHeader}>
              <Text h2 h2Style={styles.word}>{entry.word}</Text>
              {entry.phonetic && (
                <Text style={styles.phonetic}>{entry.phonetic}</Text>
              )}
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
                <Button
                  title="Save to Collection"
                  onPress={handleSave}
                  buttonStyle={styles.saveButton}
                  titleStyle={styles.saveButtonText}
                  containerStyle={styles.saveContainer}
                />
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
            <Text style={styles.emptyIcon}>{"\u{1F4D6}"}</Text>
            <Text style={styles.emptyText}>
              Enter a word above to discover{"\n"}its meaning
            </Text>
          </View>
        )}
      </ScrollView>
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
  },
  screenOrnament: {
    color: colors.faded,
    textAlign: "center",
    fontSize: 12,
    letterSpacing: 6,
    marginTop: 6,
    marginBottom: 20,
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
  },
  loadingText: {
    textAlign: "center",
    color: colors.ember,
    marginTop: 24,
    fontStyle: "italic",
    letterSpacing: 1,
    fontSize: 14,
  },
  error: {
    color: colors.bloodBright,
    textAlign: "center",
    marginTop: 24,
    fontSize: 14,
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
  word: {
    color: colors.bone,
    fontWeight: "300",
    letterSpacing: 2,
  },
  phonetic: {
    color: colors.ember,
    fontSize: 15,
    fontStyle: "italic",
    marginTop: 4,
    letterSpacing: 1,
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
    fontWeight: "600",
  },
  definitionItem: {
    flexDirection: "row",
    marginBottom: 14,
    paddingLeft: 4,
  },
  defNumber: {
    color: colors.amberMuted,
    fontSize: 13,
    fontWeight: "600",
    marginRight: 10,
    marginTop: 1,
    minWidth: 16,
  },
  defContent: {
    flex: 1,
  },
  definitionText: {
    lineHeight: 23,
    color: colors.parchment,
    fontSize: 15,
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
  },
  meaningDivider: {
    color: colors.faded,
    textAlign: "center",
    fontSize: 11,
    letterSpacing: 6,
    marginVertical: 14,
  },
  saveWrap: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: colors.charcoal,
    paddingTop: 20,
  },
  saveContainer: {},
  saveButton: {
    borderRadius: 12,
    paddingVertical: 13,
    backgroundColor: colors.wine,
  },
  saveButtonText: {
    color: colors.bone,
    fontWeight: "600",
    letterSpacing: 2,
    textTransform: "uppercase",
    fontSize: 12,
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
    fontWeight: "600",
    letterSpacing: 2,
    textTransform: "uppercase",
    fontSize: 12,
  },
  emptyState: {
    alignItems: "center",
    marginTop: 60,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 16,
    opacity: 0.4,
  },
  emptyText: {
    color: colors.ghost,
    textAlign: "center",
    lineHeight: 22,
    fontStyle: "italic",
    fontSize: 14,
  },
});
