import React, { useState } from "react";
import { View, Button, TextInput, Alert, StyleSheet } from "react-native";
import { useAuth } from "../auth/AuthProvider";

export default function SignInScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    try {
      setLoading(true);
      await signIn(email, password);
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert("Sign In Failed", error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const isValid = email.trim().length > 0 && password.length > 0;

  return (
    <View style={styles.container}>
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button
        title={loading ? "Signing in..." : "Sign In"}
        onPress={handleSignIn}
        disabled={loading || !isValid}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
});
