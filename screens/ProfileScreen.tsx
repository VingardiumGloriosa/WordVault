import { View, StyleSheet } from "react-native";
import { useAuth } from "../auth/AuthProvider";
import Account from "../components/Account";

export default function ProfileScreen() {
  const { session } = useAuth();
  return (
    <View style={styles.container}>
      <Account session={session} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a0a",
  },
});
