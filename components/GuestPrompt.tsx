import { View, StyleSheet } from "react-native";
import { Text, Button } from "@rneui/themed";
import { useNavigation } from "@react-navigation/native";
import { colors, fonts, ornament } from "../theme";

interface GuestPromptProps {
  icon: string;
  title: string;
  message: string;
}

export default function GuestPrompt({ icon, title, message }: GuestPromptProps) {
  const navigation = useNavigation<any>();

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.icon}>{icon}</Text>
        <View style={styles.textBlock}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
        </View>
      </View>
      <Button
        title="Sign In"
        onPress={() => navigation.navigate("Profile")}
        buttonStyle={styles.button}
        titleStyle={styles.buttonText}
        containerStyle={styles.buttonContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.obsidian,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.charcoal,
    padding: 20,
    marginHorizontal: 16,
    marginTop: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  icon: {
    fontSize: 28,
    marginRight: 14,
    opacity: 0.6,
  },
  textBlock: {
    flex: 1,
  },
  title: {
    color: colors.bone,
    fontSize: 15,
    fontWeight: "300",
    letterSpacing: 1,
    marginBottom: 4,
    fontFamily: fonts.display,
  },
  message: {
    color: colors.ash,
    lineHeight: 20,
    fontStyle: "italic",
    fontSize: 13,
    fontFamily: fonts.body,
  },
  buttonContainer: {
    minWidth: 120,
  },
  button: {
    borderRadius: 10,
    paddingVertical: 11,
    backgroundColor: colors.wine,
  },
  buttonText: {
    color: colors.bone,
    fontWeight: "700",
    letterSpacing: 2,
    textTransform: "uppercase",
    fontSize: 11,
    fontFamily: fonts.body,
  },
});
