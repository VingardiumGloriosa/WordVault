import { Button, Text } from "@rneui/themed";
import { ornament } from "../../theme";
import ScreenContainer from "../../components/ScreenContainer";
import { authStyles as styles } from "./styles";

type CheckEmailContext = "magic" | "reset" | "signup";

type Props = {
  email: string;
  context: CheckEmailContext;
  loading: boolean;
  onResend: () => void;
  onBack: () => void;
};

const contextMessages: Record<CheckEmailContext, string> = {
  magic: "A sign-in link has been sent to",
  reset: "A password reset link has been sent to",
  signup: "A confirmation link has been sent to",
};

export default function CheckEmailView({ email, context, loading, onResend, onBack }: Props) {
  return (
    <ScreenContainer style={{ justifyContent: "center", padding: 28 }}>
      <Text style={styles.ornament}>{ornament}</Text>
      <Text h3 h3Style={styles.confirmTitle}>Check Your Email</Text>
      <Text style={styles.confirmBody}>
        {contextMessages[context]}{"\n"}
        <Text style={styles.emailHighlight}>{email.trim()}</Text>
      </Text>
      <Text style={styles.ornament}>{ornament}</Text>
      <Button
        title={loading ? "Sending..." : "Resend Email"}
        type="outline"
        onPress={onResend}
        disabled={loading}
        containerStyle={styles.buttonContainer}
        buttonStyle={styles.outlineButton}
        titleStyle={styles.outlineButtonText}
      />
      <Button
        title="Back"
        type="clear"
        onPress={onBack}
        containerStyle={{ marginTop: 12 }}
        titleStyle={styles.toggleText}
      />
    </ScreenContainer>
  );
}
