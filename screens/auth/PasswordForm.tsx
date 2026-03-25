import { View, KeyboardAvoidingView, Platform } from "react-native";
import { Input, Button, Text } from "@rneui/themed";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme";
import { validatePassword } from "../../lib/authErrors";
import ScreenContainer from "../../components/ScreenContainer";
import BrandHeader from "./BrandHeader";
import { authStyles as styles } from "./styles";

type Props = {
  email: string;
  password: string;
  emailValid: boolean;
  loading: boolean;
  isSignUp: boolean;
  onChangeEmail: (text: string) => void;
  onChangePassword: (text: string) => void;
  onSubmit: () => void;
  onForgotPassword: () => void;
  onToggleSignUp: () => void;
  onSwitchToMagicLink: () => void;
};

export default function PasswordForm({
  email, password, emailValid, loading, isSignUp,
  onChangeEmail, onChangePassword, onSubmit,
  onForgotPassword, onToggleSignUp, onSwitchToMagicLink,
}: Props) {
  const passwordValid = isSignUp ? !validatePassword(password) : password.length > 0;
  const isValid = emailValid && passwordValid;

  return (
    <ScreenContainer>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <BrandHeader />
        <Text style={styles.modeLabel}>
          {isSignUp ? "Create Account" : "Sign In"}
        </Text>
        <View style={styles.formCard}>
          <Input
            placeholder="email"
            placeholderTextColor={colors.ghost}
            value={email}
            onChangeText={onChangeEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            errorMessage={email.length > 0 && !emailValid ? "invalid email format" : undefined}
            leftIcon={<Ionicons name="mail-outline" size={18} color={colors.amberMuted} />}
            containerStyle={styles.inputContainer}
            inputStyle={styles.inputText}
            inputContainerStyle={styles.inputInner}
            errorStyle={styles.errorText}
          />
          <Input
            placeholder="password"
            placeholderTextColor={colors.ghost}
            value={password}
            onChangeText={onChangePassword}
            secureTextEntry
            errorMessage={
              password.length > 0 && isSignUp
                ? validatePassword(password) ?? undefined
                : undefined
            }
            leftIcon={<Ionicons name="lock-closed-outline" size={18} color={colors.amberMuted} />}
            containerStyle={styles.inputContainer}
            inputStyle={styles.inputText}
            inputContainerStyle={styles.inputInner}
            errorStyle={styles.errorText}
          />
          <Button
            title={loading
              ? (isSignUp ? "Creating..." : "Signing in...")
              : (isSignUp ? "Create Account" : "Enter")}
            onPress={onSubmit}
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
              onPress={onForgotPassword}
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
          onPress={onToggleSignUp}
          containerStyle={styles.toggleContainer}
          titleStyle={styles.toggleText}
        />
        <Button
          title="Use magic link instead"
          type="clear"
          onPress={onSwitchToMagicLink}
          titleStyle={styles.toggleText}
        />
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
