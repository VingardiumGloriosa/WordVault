import { useState, useEffect } from "react";
import { Alert } from "react-native";
import { useAuth } from "../auth/AuthProvider";
import {
  EMAIL_REGEX,
  friendlyAuthError,
  validatePassword,
} from "../lib/authErrors";
import CheckEmailView from "./auth/CheckEmailView";
import MagicLinkForm from "./auth/MagicLinkForm";
import PasswordForm from "./auth/PasswordForm";
import ResetPasswordForm from "./auth/ResetPasswordForm";

type Mode = "magic" | "password" | "checkEmail" | "resetPassword";
type CheckEmailContext = "magic" | "reset" | "signup";

export default function SignInScreen() {
  const {
    signIn, signUp, sendMagicLink, sendPasswordReset,
    updatePassword, isRecoveryFlow, clearRecoveryFlow,
  } = useAuth();

  const [mode, setMode] = useState<Mode>("magic");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [checkEmailContext, setCheckEmailContext] = useState<CheckEmailContext>("magic");

  const emailValid = EMAIL_REGEX.test(email.trim());

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

  if (mode === "checkEmail") {
    return (
      <CheckEmailView
        email={email}
        context={checkEmailContext}
        loading={loading}
        onResend={handleResend}
        onBack={() => { setMode("magic"); setPassword(""); }}
      />
    );
  }

  if (mode === "resetPassword") {
    return (
      <ResetPasswordForm
        password={password}
        confirmPassword={confirmPassword}
        loading={loading}
        onChangePassword={setPassword}
        onChangeConfirmPassword={setConfirmPassword}
        onSubmit={handleUpdatePassword}
        onCancel={() => {
          clearRecoveryFlow();
          setMode("magic");
          setPassword("");
          setConfirmPassword("");
        }}
      />
    );
  }

  if (mode === "magic") {
    return (
      <MagicLinkForm
        email={email}
        emailValid={emailValid}
        loading={loading}
        onChangeEmail={setEmail}
        onSubmit={handleMagicLink}
        onSwitchToPassword={() => setMode("password")}
      />
    );
  }

  return (
    <PasswordForm
      email={email}
      password={password}
      emailValid={emailValid}
      loading={loading}
      isSignUp={isSignUp}
      onChangeEmail={setEmail}
      onChangePassword={setPassword}
      onSubmit={handlePasswordSubmit}
      onForgotPassword={handleForgotPassword}
      onToggleSignUp={() => { setIsSignUp(!isSignUp); setPassword(""); }}
      onSwitchToMagicLink={() => { setMode("magic"); setPassword(""); }}
    />
  );
}
