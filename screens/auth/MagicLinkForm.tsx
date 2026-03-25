import { View, KeyboardAvoidingView, Platform } from "react-native";
import { Input, Button, Text } from "@rneui/themed";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme";
import ScreenContainer from "../../components/ScreenContainer";
import BrandHeader from "./BrandHeader";
import { authStyles as styles } from "./styles";

type Props = {
  email: string;
  emailValid: boolean;
  loading: boolean;
  onChangeEmail: (text: string) => void;
  onSubmit: () => void;
  onSwitchToPassword: () => void;
};

export default function MagicLinkForm({
  email, emailValid, loading,
  onChangeEmail, onSubmit, onSwitchToPassword,
}: Props) {
  return (
    <ScreenContainer>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <BrandHeader />
        <Text style={styles.modeLabel}>Sign In</Text>
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
          <Button
            title={loading ? "Sending..." : "Send Magic Link"}
            onPress={onSubmit}
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
          onPress={onSwitchToPassword}
          containerStyle={styles.toggleContainer}
          titleStyle={styles.toggleText}
        />
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
