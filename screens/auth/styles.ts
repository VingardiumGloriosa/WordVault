import { StyleSheet } from "react-native";
import { colors, fonts } from "../../theme";

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
    fontFamily: fonts.body,
  },
  brand: {
    color: colors.bone,
    letterSpacing: 6,
    textTransform: "uppercase",
    fontWeight: "300",
    fontSize: 30,
    fontFamily: fonts.display,
  },
  tagline: {
    color: colors.ash,
    fontSize: 12,
    fontStyle: "italic",
    marginTop: 4,
    letterSpacing: 2,
    fontFamily: fonts.body,
  },
  modeLabel: {
    color: colors.parchment,
    textAlign: "center",
    fontSize: 13,
    letterSpacing: 3,
    textTransform: "uppercase",
    marginBottom: 20,
    fontFamily: fonts.body,
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
    fontFamily: fonts.body,
  },
  errorText: {
    color: colors.bloodBright,
    fontSize: 11,
    fontFamily: fonts.body,
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
    fontWeight: "700",
    letterSpacing: 2,
    textTransform: "uppercase",
    fontSize: 13,
    fontFamily: fonts.body,
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
    fontFamily: fonts.body,
  },
  toggleContainer: {
    marginTop: 20,
  },
  toggleText: {
    color: colors.ash,
    fontSize: 13,
    fontFamily: fonts.body,
  },
  forgotText: {
    color: colors.ash,
    fontSize: 12,
    fontStyle: "italic",
    fontFamily: fonts.body,
  },
  confirmTitle: {
    color: colors.bone,
    fontWeight: "300",
    letterSpacing: 2,
    textAlign: "center",
    fontFamily: fonts.display,
  },
  confirmBody: {
    color: colors.parchment,
    textAlign: "center",
    lineHeight: 24,
    marginVertical: 16,
    fontSize: 15,
    fontFamily: fonts.body,
  },
  emailHighlight: {
    color: colors.ember,
    fontStyle: "italic",
    fontFamily: fonts.body,
  },
});
