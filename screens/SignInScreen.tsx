import React, { useState, useEffect } from "react";
import { View, Alert, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Input, Button, Text } from "@rneui/themed";
import { useAuth } from "../auth/AuthProvider";
import { colors, ornament } from "../theme";
import {
  EMAIL_REGEX,
  friendlyAuthError,
  validatePassword,
} from "../lib/authErrors";

type Mode = "magic" | "password" | "checkEmail" | "resetPassword";
type CheckEmailContext = "magic" | "reset" | "signup";

export default function SignInScreen() {
  const {
    signIn,
    signUp,
    sendMagicLink,
    sendPasswordReset,
    updatePassword,
    isRecoveryFlow,
    clearRecoveryFlow,
  } = useAuth();

  const [mode, setMode] = useState<Mode>("magic");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [checkEmailContext, setCheckEmailContext] = useState<CheckEmailContext>("magic");

  const emailValid = EMAIL_REGEX.test(email.trim());

  // Auto-enter resetPassword mode when recovery flow is detected
  useEffect(() => {
    if (isRecoveryFlow) {
      setMode("resetPassword");
      setPassword("");
      setConfirmPassword("");
    }
  }, [isRecoveryFlow]);

  const handleMagicLink = async () => {
    if (!emailValid) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }
    try {
      setLoading(true);
      await sendMagicLink(email.trim());
      setCheckEmailContext("magic");
      setMode("checkEmail");
    } catch (error) {
      Alert.alert("Error", friendlyAuthError(error));
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async () => {
    if (!emailValid) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }
    const pwError = validatePassword(password);
    if (isSignUp && pwError) {
      Alert.alert("Weak Password", pwError);
      return;
    }
    if (!isSignUp && password.length === 0) {
      Alert.alert("Missing Password", "Please enter your password.");
      return;
    }
    try {
      setLoading(true);
      if (isSignUp) {
        await signUp(email.trim(), password);
        setCheckEmailContext("signup");
        setMode("checkEmail");
      } else {
        await signIn(email.trim(), password);
      }
    } catch (error) {
      Alert.alert(
        isSignUp ? "Sign Up Failed" : "Sign In Failed",
        friendlyAuthError(error),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!emailValid) {
      Alert.alert("Enter Email First", "Please enter your email above, then tap Forgot Password.");
      return;
    }
    try {
      setLoading(true);
      await sendPasswordReset(email.trim());
      setCheckEmailContext("reset");
      setMode("checkEmail");
    } catch (error) {
      Alert.alert("Error", friendlyAuthError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    const pwError = validatePassword(password);
    if (pwError) {
      Alert.alert("Weak Password", pwError);
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Mismatch", "Passwords do not match.");
      return;
    }
    try {
      setLoading(true);
      await updatePassword(password);
      Alert.alert("Success", "Your password has been updated.");
    } catch (error) {
      Alert.alert("Error", friendlyAuthError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      setLoading(true);
      if (checkEmailContext === "magic") {
        await sendMagicLink(email.trim());
      } else if (checkEmailContext === "reset") {
        await sendPasswordReset(email.trim());
      } else {
        await signUp(email.trim(), password);
      }
      Alert.alert("Sent", "A new email has been sent.");
    } catch (error) {
      Alert.alert("Error", friendlyAuthError(error));
    } finally {
      setLoading(false);
    }
  };

  // --- Check Email screen ---
  if (mode === "checkEmail") {
    const contextMessages: Record<CheckEmailContext, string> = {
      magic: "A sign-in link has been sent to",
      reset: "A password reset link has been sent to",
      signup: "A confirmation link has been sent to",
    };
    return (
      <LinearGradient
        colors={[colors.void, colors.abyss, colors.burgundy + "30", colors.void]}
        locations={[0, 0.3, 0.7, 1]}
        style={styles.container}
      >
        <Text style={styles.ornament}>{ornament}</Text>
        <Text h3 h3Style={styles.confirmTitle}>Check Your Email</Text>
        <Text style={styles.confirmBody}>
          {contextMessages[checkEmailContext]}{"\n"}
          <Text style={styles.emailHighlight}>{email.trim()}</Text>
        </Text>
        <Text style={styles.ornament}>{ornament}</Text>
        <Button
          title={loading ? "Sending..." : "Resend Email"}
          type="outline"
          onPress={handleResend}
          disabled={loading}
          containerStyle={styles.buttonContainer}
          buttonStyle={styles.outlineButton}
          titleStyle={styles.outlineButtonText}
        />
        <Button
          title="Back"
          type="clear"
          onPress={() => {
            setMode("magic");
            setPassword("");
          }}
          containerStyle={{ marginTop: 12 }}
          titleStyle={styles.toggleText}
        />
      </LinearGradient>
    );
  }

  // --- Reset Password screen ---
  if (mode === "resetPassword") {
    return (
      <LinearGradient
        colors={[colors.void, colors.abyss, colors.burgundy + "25", colors.void]}
        locations={[0, 0.4, 0.7, 1]}
        style={styles.flex}
      >
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.brandBlock}>
            <Text style={styles.ornament}>{ornament}</Text>
            <Text h1 h1Style={styles.brand}>WordVault</Text>
            <Text style={styles.tagline}>set a new password</Text>
            <Text style={styles.ornament}>{ornament}</Text>
          </View>

          <Text style={styles.modeLabel}>Reset Password</Text>

          <View style={styles.formCard}>
            <Input
              placeholder="new password"
              placeholderTextColor={colors.ghost}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              errorMessage={
                password.length > 0 ? validatePassword(password) ?? undefined : undefined
              }
              leftIcon={{ name: "lock", type: "material", color: colors.amberMuted, size: 18 }}
              containerStyle={styles.inputContainer}
              inputStyle={styles.inputText}
              inputContainerStyle={styles.inputInner}
              errorStyle={styles.errorText}
            />
            <Input
              placeholder="confirm password"
              placeholderTextColor={colors.ghost}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              errorMessage={
                confirmPassword.length > 0 && password !== confirmPassword
                  ? "passwords do not match"
                  : undefined
              }
              leftIcon={{ name: "lock-outline", type: "material", color: colors.amberMuted, size: 18 }}
              containerStyle={styles.inputContainer}
              inputStyle={styles.inputText}
              inputContainerStyle={styles.inputInner}
              errorStyle={styles.errorText}
            />
            <Button
              title={loading ? "Updating..." : "Update Password"}
              onPress={handleUpdatePassword}
              disabled={loading || !password || password !== confirmPassword || !!validatePassword(password)}
              containerStyle={styles.buttonContainer}
              buttonStyle={styles.primaryButton}
              disabledStyle={styles.disabledButton}
              titleStyle={styles.primaryButtonText}
              disabledTitleStyle={styles.disabledButtonText}
            />
          </View>

          <Button
            title="Cancel"
            type="clear"
            onPress={() => {
              clearRecoveryFlow();
              setMode("magic");
              setPassword("");
              setConfirmPassword("");
            }}
            containerStyle={styles.toggleContainer}
            titleStyle={styles.toggleText}
          />
        </KeyboardAvoidingView>
      </LinearGradient>
    );
  }

  // --- Magic Link screen (default) ---
  if (mode === "magic") {
    return (
      <LinearGradient
        colors={[colors.void, colors.abyss, colors.burgundy + "25", colors.void]}
        locations={[0, 0.4, 0.7, 1]}
        style={styles.flex}
      >
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.brandBlock}>
            <Text style={styles.ornament}>{ornament}</Text>
            <Text h1 h1Style={styles.brand}>WordVault</Text>
            <Text style={styles.tagline}>a compendium of language</Text>
            <Text style={styles.ornament}>{ornament}</Text>
          </View>

          <Text style={styles.modeLabel}>Sign In</Text>

          <View style={styles.formCard}>
            <Input
              placeholder="email"
              placeholderTextColor={colors.ghost}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              errorMessage={email.length > 0 && !emailValid ? "invalid email format" : undefined}
              leftIcon={{ name: "email", type: "material", color: colors.amberMuted, size: 18 }}
              containerStyle={styles.inputContainer}
              inputStyle={styles.inputText}
              inputContainerStyle={styles.inputInner}
              errorStyle={styles.errorText}
            />
            <Button
              title={loading ? "Sending..." : "Send Magic Link"}
              onPress={handleMagicLink}
              disabled={loading || !emailValid}
              containerStyle={styles.buttonContainer}
              buttonStyle={styles.primaryButton}
              disabledStyle={styles.disabledButton}
              titleStyle={styles.primaryButtonText}
              disabledTitleStyle={styles.disabledButtonText}
            />
          </View>

          <Button
            title="Use password instead"
            type="clear"
            onPress={() => setMode("password")}
            containerStyle={styles.toggleContainer}
            titleStyle={styles.toggleText}
          />
        </KeyboardAvoidingView>
      </LinearGradient>
    );
  }

  // --- Password screen ---
  const passwordValid = isSignUp ? !validatePassword(password) : password.length > 0;
  const isValid = emailValid && passwordValid;

  return (
    <LinearGradient
      colors={[colors.void, colors.abyss, colors.burgundy + "25", colors.void]}
      locations={[0, 0.4, 0.7, 1]}
      style={styles.flex}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.brandBlock}>
          <Text style={styles.ornament}>{ornament}</Text>
          <Text h1 h1Style={styles.brand}>WordVault</Text>
          <Text style={styles.tagline}>a compendium of language</Text>
          <Text style={styles.ornament}>{ornament}</Text>
        </View>

        <Text style={styles.modeLabel}>
          {isSignUp ? "Create Account" : "Sign In"}
        </Text>

        <View style={styles.formCard}>
          <Input
            placeholder="email"
            placeholderTextColor={colors.ghost}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            errorMessage={email.length > 0 && !emailValid ? "invalid email format" : undefined}
            leftIcon={{ name: "email", type: "material", color: colors.amberMuted, size: 18 }}
            containerStyle={styles.inputContainer}
            inputStyle={styles.inputText}
            inputContainerStyle={styles.inputInner}
            errorStyle={styles.errorText}
          />

          <Input
            placeholder="password"
            placeholderTextColor={colors.ghost}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            errorMessage={
              password.length > 0 && isSignUp
                ? validatePassword(password) ?? undefined
                : undefined
            }
            leftIcon={{ name: "lock", type: "material", color: colors.amberMuted, size: 18 }}
            containerStyle={styles.inputContainer}
            inputStyle={styles.inputText}
            inputContainerStyle={styles.inputInner}
            errorStyle={styles.errorText}
          />

          <Button
            title={loading
              ? (isSignUp ? "Creating..." : "Signing in...")
              : (isSignUp ? "Create Account" : "Enter")}
            onPress={handlePasswordSubmit}
            disabled={loading || !isValid}
            containerStyle={styles.buttonContainer}
            buttonStyle={styles.primaryButton}
            disabledStyle={styles.disabledButton}
            titleStyle={styles.primaryButtonText}
            disabledTitleStyle={styles.disabledButtonText}
          />

          {!isSignUp && (
            <Button
              title="Forgot Password?"
              type="clear"
              onPress={handleForgotPassword}
              disabled={loading}
              titleStyle={styles.forgotText}
              containerStyle={{ marginTop: 8 }}
            />
          )}
        </View>

        <Button
          title={isSignUp
            ? "Already have an account? Sign in"
            : "Need an account? Create one"}
          type="clear"
          onPress={() => {
            setIsSignUp(!isSignUp);
            setPassword("");
          }}
          containerStyle={styles.toggleContainer}
          titleStyle={styles.toggleText}
        />

        <Button
          title="Use magic link instead"
          type="clear"
          onPress={() => {
            setMode("magic");
            setPassword("");
          }}
          titleStyle={styles.toggleText}
        />
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 28,
  },
  brandBlock: {
    alignItems: "center",
    marginBottom: 32,
  },
  ornament: {
    color: colors.faded,
    fontSize: 14,
    letterSpacing: 6,
    textAlign: "center",
    marginVertical: 8,
  },
  brand: {
    color: colors.bone,
    letterSpacing: 6,
    textTransform: "uppercase",
    fontWeight: "300",
    fontSize: 30,
  },
  tagline: {
    color: colors.ash,
    fontSize: 12,
    fontStyle: "italic",
    marginTop: 4,
    letterSpacing: 2,
  },
  modeLabel: {
    color: colors.parchment,
    textAlign: "center",
    fontSize: 13,
    letterSpacing: 3,
    textTransform: "uppercase",
    marginBottom: 20,
  },
  formCard: {
    backgroundColor: colors.obsidian + "cc",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.charcoal,
    padding: 20,
    paddingTop: 24,
  },
  inputContainer: {
    marginBottom: 2,
  },
  inputInner: {
    borderBottomColor: colors.charcoal,
    borderBottomWidth: 1,
  },
  inputText: {
    color: colors.bone,
    fontSize: 15,
  },
  errorText: {
    color: colors.bloodBright,
    fontSize: 11,
  },
  buttonContainer: {
    marginTop: 12,
  },
  primaryButton: {
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.wine,
  },
  primaryButtonText: {
    color: colors.bone,
    fontWeight: "600",
    letterSpacing: 2,
    textTransform: "uppercase",
    fontSize: 13,
  },
  disabledButton: {
    backgroundColor: colors.charcoal,
  },
  disabledButtonText: {
    color: colors.ghost,
  },
  outlineButton: {
    borderColor: colors.ember,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    backgroundColor: "transparent",
  },
  outlineButtonText: {
    color: colors.ember,
    letterSpacing: 2,
    textTransform: "uppercase",
    fontSize: 12,
  },
  toggleContainer: {
    marginTop: 20,
  },
  toggleText: {
    color: colors.ash,
    fontSize: 13,
  },
  forgotText: {
    color: colors.ash,
    fontSize: 12,
    fontStyle: "italic",
  },
  confirmTitle: {
    color: colors.bone,
    fontWeight: "300",
    letterSpacing: 2,
    textAlign: "center",
  },
  confirmBody: {
    color: colors.parchment,
    textAlign: "center",
    lineHeight: 24,
    marginVertical: 16,
    fontSize: 15,
  },
  emailHighlight: {
    color: colors.ember,
    fontStyle: "italic",
  },
});
