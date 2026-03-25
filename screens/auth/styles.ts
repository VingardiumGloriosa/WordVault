import { StyleSheet } from "react-native";
import { colors } from "../../theme";

export const authStyles = StyleSheet.create({
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
