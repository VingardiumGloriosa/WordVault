import { useState, useRef, useEffect } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from "react-native";
import { Text } from "@rneui/themed";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme";

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  existingTags: string[];
  placeholder?: string;
};

export default function TagAutocompleteInput({
  value,
  onChangeText,
  existingTags,
  placeholder = 'tag (optional) e.g. "SAT prep"',
}: Props) {
  const [focused, setFocused] = useState(false);
  const blurTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (blurTimerRef.current) clearTimeout(blurTimerRef.current);
    };
  }, []);

  const suggestions =
    focused && value.length > 0
      ? existingTags.filter(
          (t) =>
            t.toLowerCase().startsWith(value.toLowerCase()) &&
            t.toLowerCase() !== value.toLowerCase(),
        )
      : [];

  return (
    <View style={styles.wrapper}>
      <View style={styles.inputRow}>
        <Ionicons
          name="pricetag-outline"
          size={16}
          color={colors.amberMuted}
          style={styles.icon}
        />
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.ghost}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            if (blurTimerRef.current) clearTimeout(blurTimerRef.current);
            blurTimerRef.current = setTimeout(() => setFocused(false), 150);
          }}
        />
      </View>
      {suggestions.length > 0 && (
        <View style={styles.dropdown}>
          <FlatList
            data={suggestions}
            keyExtractor={(item) => item}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.suggestion}
                onPress={() => {
                  onChangeText(item);
                  setFocused(false);
                }}
              >
                <Text style={styles.suggestionText}>{item}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "relative",
    zIndex: 10,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: colors.charcoal,
    paddingBottom: 8,
  },
  icon: {
    marginRight: 10,
    marginLeft: 10,
  },
  input: {
    flex: 1,
    color: colors.bone,
    fontSize: 15,
  },
  dropdown: {
    backgroundColor: colors.smoke,
    borderWidth: 1,
    borderColor: colors.charcoal,
    borderRadius: 10,
    marginTop: 4,
    maxHeight: 150,
    overflow: "hidden",
  },
  suggestion: {
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  suggestionText: {
    color: colors.parchment,
    fontSize: 14,
  },
});
