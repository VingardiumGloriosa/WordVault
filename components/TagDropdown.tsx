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
  onDeleteTag?: (tag: string) => void;
};

export default function TagDropdown({ tags, selectedTag, onSelectTag, onDeleteTag }: Props) {
  const [visible, setVisible] = useState(false);

  const sorted = [...tags].sort((a, b) => a.localeCompare(b));
  const options: (string | null)[] = [null, "__untagged__", ...sorted];

  return (
    <>
      <TouchableOpacity
        style={styles.trigger}
        onPress={() => setVisible(true)}
        activeOpacity={0.7}
      >
        <Text style={styles.triggerText}>
          {selectedTag === "__untagged__" ? "Untagged" : selectedTag ?? "All"}
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
                  <View style={styles.optionRow}>
                    <TouchableOpacity
                      style={[styles.option, isActive && styles.optionActive, { flex: 1 }]}
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
                        {item === "__untagged__" ? "Untagged" : item ?? "All"}
                      </Text>
                    </TouchableOpacity>
                    {item !== null && item !== "__untagged__" && onDeleteTag && (
                      <TouchableOpacity
                        style={styles.deleteBtn}
                        onPress={() => {
                          setVisible(false);
                          onDeleteTag(item);
                        }}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.deleteBtnText}>{"\u00D7"}</Text>
                      </TouchableOpacity>
                    )}
                  </View>
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
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  deleteBtn: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  deleteBtnText: {
    color: colors.blood,
    fontSize: 18,
    fontWeight: "600",
  },
});
