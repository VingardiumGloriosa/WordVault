import React, { useState } from "react";
import { View, Alert, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import { Input, Button, Text } from "@rneui/themed";
import { useAuth } from "../auth/AuthProvider";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignInScreen() {
  const { signIn, signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [confirmationSent, setConfirmationSent] = useState(false);

  const emailValid = EMAIL_REGEX.test(email.trim());
  const isValid = emailValid && password.length >= 6;

  const handleSubmit = async () => {
    if (!emailValid) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Weak Password", "Password must be at least 6 characters.");
      return;
    }

    try {
      setLoading(true);
      if (isSignUp) {
        await signUp(email.trim(), password);
        setConfirmationSent(true);
      } else {
        await signIn(email.trim(), password);
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(isSignUp ? "Sign Up Failed" : "Sign In Failed", error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  if (confirmationSent) {
    return (
      <View style={styles.container}>
        <Text h3 style={styles.title}>Check Your Email</Text>
        <Text style={styles.subtitle}>
          We sent a confirmation link to {email.trim()}. Verify your email to get in.
        </Text>
        <Button
          title="Back to Sign In"
          type="outline"
          onPress={() => {
            setConfirmationSent(false);
            setIsSignUp(false);
            setPassword("");
          }}
          containerStyle={styles.buttonContainer}
          buttonStyle={styles.outlineButton}
          titleStyle={styles.outlineButtonText}
        />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Text h1 style={styles.brand}>WordVault</Text>
      <Text style={styles.tagline}>your dark little dictionary</Text>
      <Text style={styles.subtitle}>
        {isSignUp ? "Create your account" : "Sign in to your account"}
      </Text>

      <Input
        placeholder="Email"
        placeholderTextColor="#555"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        errorMessage={email.length > 0 && !emailValid ? "Invalid email format" : undefined}
        leftIcon={{ name: "email", type: "material", color: "#a855f7", size: 20 }}
        containerStyle={styles.inputContainer}
        inputStyle={styles.inputText}
        inputContainerStyle={styles.inputInner}
        labelStyle={styles.label}
        errorStyle={styles.errorText}
      />

      <Input
        placeholder="Password"
        placeholderTextColor="#555"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        errorMessage={password.length > 0 && password.length < 6 ? "At least 6 characters" : undefined}
        leftIcon={{ name: "lock", type: "material", color: "#a855f7", size: 20 }}
        containerStyle={styles.inputContainer}
        inputStyle={styles.inputText}
        inputContainerStyle={styles.inputInner}
        labelStyle={styles.label}
        errorStyle={styles.errorText}
      />

      <Button
        title={loading ? (isSignUp ? "Creating account..." : "Signing in...") : (isSignUp ? "Sign Up" : "Sign In")}
        onPress={handleSubmit}
        disabled={loading || !isValid}
        containerStyle={styles.buttonContainer}
        buttonStyle={styles.primaryButton}
        disabledStyle={styles.disabledButton}
        titleStyle={styles.primaryButtonText}
      />

      <Button
        title={isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
        type="clear"
        onPress={() => {
          setIsSignUp(!isSignUp);
          setPassword("");
        }}
        containerStyle={styles.toggleContainer}
        titleStyle={styles.toggleText}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#0a0a0a",
  },
  brand: {
    textAlign: "center",
    color: "#a855f7",
    marginBottom: 2,
    letterSpacing: 2,
  },
  tagline: {
    textAlign: "center",
    color: "#555",
    fontSize: 13,
    fontStyle: "italic",
    marginBottom: 24,
    letterSpacing: 1,
  },
  title: {
    textAlign: "center",
    color: "#d4d4d4",
    marginBottom: 8,
  },
  subtitle: {
    textAlign: "center",
    color: "#777",
    marginBottom: 32,
    fontSize: 15,
  },
  inputContainer: {
    marginBottom: 4,
  },
  inputInner: {
    borderBottomColor: "#2a1545",
    borderBottomWidth: 1.5,
  },
  inputText: {
    color: "#d4d4d4",
  },
  label: {
    color: "#a855f7",
  },
  errorText: {
    color: "#dc2626",
  },
  buttonContainer: {
    marginTop: 12,
    marginHorizontal: 10,
  },
  primaryButton: {
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: "#7c3aed",
  },
  primaryButtonText: {
    color: "#e8e0f0",
    fontWeight: "bold",
    letterSpacing: 1,
  },
  disabledButton: {
    backgroundColor: "#1e1035",
  },
  outlineButton: {
    borderColor: "#a855f7",
    borderWidth: 1.5,
    borderRadius: 10,
    paddingVertical: 12,
    backgroundColor: "transparent",
  },
  outlineButtonText: {
    color: "#a855f7",
  },
  toggleContainer: {
    marginTop: 16,
  },
  toggleText: {
    color: "#7c3aed",
    fontSize: 14,
  },
});
