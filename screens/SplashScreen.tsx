import React from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Text } from "@rneui/themed";
import { colors, ornament } from "../theme";

export default function SplashScreen() {
  return (
    <LinearGradient
      colors={[colors.void, colors.abyss, colors.burgundy + "40", colors.void]}
      locations={[0, 0.3, 0.6, 1]}
      style={styles.container}
    >
      <Text style={styles.ornamentTop}>{ornament}</Text>
      <Text h1 h1Style={styles.title}>WordVault</Text>
      <Text style={styles.subtitle}>a compendium of language</Text>
      <Text style={styles.ornamentBottom}>{ornament}</Text>
      <ActivityIndicator size="small" color={colors.ember} style={styles.spinner} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  ornamentTop: {
    color: colors.faded,
    fontSize: 16,
    marginBottom: 16,
    letterSpacing: 6,
  },
  title: {
    color: colors.bone,
    letterSpacing: 6,
    textTransform: "uppercase",
    fontWeight: "300",
    fontSize: 32,
  },
  subtitle: {
    color: colors.ash,
    fontSize: 13,
    fontStyle: "italic",
    marginTop: 6,
    letterSpacing: 3,
  },
  ornamentBottom: {
    color: colors.faded,
    fontSize: 16,
    marginTop: 16,
    letterSpacing: 6,
  },
  spinner: {
    marginTop: 40,
  },
});
