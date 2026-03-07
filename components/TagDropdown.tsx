import { useState } from "react";
import {
  View,
  Modal,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Text } from "@rneui/themed";
import { colors } from "../theme";

type Props = {
  tags: string[];
  selectedTag: string | null;
  onSelectTag: (tag: string | null) => void;
};

export default function TagDropdown({ tags, selectedTag, onSelectTag }: Props) {
  const [visible, setVisible] = useState(false);

  const sorted = [...tags].sort((a, b) => a.localeCompare(b));
  const options: (string | null)[] = [null, ...sorted];

  return (
    <>
      <TouchableOpacity
        style={styles.trigger}
        onPress={() => setVisible(true)}
        activeOpacity={0.7}
      >
        <Text style={styles.triggerText}>
          {selectedTag ?? "All"}
        </Text>
        <Text style={styles.triggerArrow}>{"\u25BE"}</Text>
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setVisible(false)}
        >
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Filter by tag</Text>
            <FlatList
              data={options}
              keyExtractor={(item) => item ?? "__all__"}
              renderItem={({ item }) => {
                const isActive = item === selectedTag;
                return (
                  <TouchableOpacity
                    style={[styles.option, isActive && styles.optionActive]}
                    onPress={() => {
                      onSelectTag(item);
                      setVisible(false);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        isActive && styles.optionTextActive,
                      ]}
                    >
                      {item ?? "All"}
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: colors.obsidian,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.charcoal,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 10,
  },
  triggerText: {
    color: colors.bone,
    fontSize: 12,
    letterSpacing: 1,
  },
  triggerArrow: {
    color: colors.ash,
    fontSize: 10,
    marginLeft: 6,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    backgroundColor: colors.obsidian,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.charcoal,
    width: 260,
    maxHeight: 360,
    padding: 16,
  },
  cardTitle: {
    color: colors.ash,
    fontSize: 10,
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 12,
    textAlign: "center",
  },
  option: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: "transparent",
  },
  optionActive: {
    borderLeftColor: colors.wine,
    backgroundColor: colors.smoke,
  },
  optionText: {
    color: colors.bone,
    fontSize: 14,
  },
  optionTextActive: {
    color: colors.ember,
  },
});
