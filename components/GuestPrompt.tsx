import { View, StyleSheet } from "react-native";
import { Text, Button } from "@rneui/themed";
import { useNavigation } from "@react-navigation/native";
import { colors, ornament } from "../theme";

interface GuestPromptProps {
  icon: string;
  title: string;
  message: string;
}

export default function GuestPrompt({ icon, title, message }: GuestPromptProps) {
  const navigation = useNavigation<any>();

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.ornament}>{ornament}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      <Text style={styles.ornament}>{ornament}</Text>
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
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  icon: {
    fontSize: 40,
    marginBottom: 12,
    opacity: 0.5,
  },
  ornament: {
    color: colors.faded,
    fontSize: 12,
    letterSpacing: 6,
    marginVertical: 10,
  },
  title: {
    color: colors.bone,
    fontSize: 18,
    fontWeight: "300",
    letterSpacing: 2,
    marginBottom: 8,
  },
  message: {
    color: colors.ash,
    textAlign: "center",
    lineHeight: 22,
    fontStyle: "italic",
    fontSize: 14,
  },
  buttonContainer: {
    marginTop: 8,
    minWidth: 160,
  },
  button: {
    borderRadius: 12,
    paddingVertical: 13,
    backgroundColor: colors.wine,
  },
  buttonText: {
    color: colors.bone,
    fontWeight: "600",
    letterSpacing: 2,
    textTransform: "uppercase",
    fontSize: 12,
  },
});
