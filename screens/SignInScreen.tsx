import React, { useState } from "react";
import { View, Button, TextInput } from "react-native";
import { useAuth } from "../auth/AuthProvider";

export default function SignInScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <View style={{ padding: 20 }}>
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="Sign In" onPress={() => signIn(email, password)} />
    </View>
  );
}
