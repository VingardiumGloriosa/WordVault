import { View, StyleSheet } from "react-native";
import { useAuth } from "../auth/AuthProvider";
import Account from "../components/Account";
import SignInScreen from "./SignInScreen";
import { colors } from "../theme";

export default function ProfileScreen() {
  const { session } = useAuth();

  if (!session) {
    return <SignInScreen />;
  }

  return (
    <View style={styles.container}>
      <Account session={session} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.void,
  },
});
