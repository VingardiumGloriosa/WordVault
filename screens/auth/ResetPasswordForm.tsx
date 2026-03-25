import { View, KeyboardAvoidingView, Platform } from "react-native";
import { Input, Button, Text } from "@rneui/themed";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme";
import { validatePassword } from "../../lib/authErrors";
import ScreenContainer from "../../components/ScreenContainer";
import BrandHeader from "./BrandHeader";
import { authStyles as styles } from "./styles";

type Props = {
  password: string;
  confirmPassword: string;
  loading: boolean;
  onChangePassword: (text: string) => void;
  onChangeConfirmPassword: (text: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
};

export default function ResetPasswordForm({
  password, confirmPassword, loading,
  onChangePassword, onChangeConfirmPassword,
  onSubmit, onCancel,
}: Props) {
  return (
    <ScreenContainer>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <BrandHeader tagline="set a new password" />
        <Text style={styles.modeLabel}>Reset Password</Text>
        <View style={styles.formCard}>
          <Input
            placeholder="new password"
            placeholderTextColor={colors.ghost}
            value={password}
            onChangeText={onChangePassword}
            secureTextEntry
            errorMessage={
              password.length > 0 ? validatePassword(password) ?? undefined : undefined
            }
            leftIcon={<Ionicons name="lock-closed-outline" size={18} color={colors.amberMuted} />}
            containerStyle={styles.inputContainer}
            inputStyle={styles.inputText}
            inputContainerStyle={styles.inputInner}
            errorStyle={styles.errorText}
          />
          <Input
            placeholder="confirm password"
            placeholderTextColor={colors.ghost}
            value={confirmPassword}
            onChangeText={onChangeConfirmPassword}
            secureTextEntry
            errorMessage={
              confirmPassword.length > 0 && password !== confirmPassword
                ? "passwords do not match"
                : undefined
            }
            leftIcon={<Ionicons name="lock-closed-outline" size={18} color={colors.amberMuted} />}
            containerStyle={styles.inputContainer}
            inputStyle={styles.inputText}
            inputContainerStyle={styles.inputInner}
            errorStyle={styles.errorText}
          />
          <Button
            title={loading ? "Updating..." : "Update Password"}
            onPress={onSubmit}
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
          onPress={onCancel}
          containerStyle={styles.toggleContainer}
          titleStyle={styles.toggleText}
        />
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
