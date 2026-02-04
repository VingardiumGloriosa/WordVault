import React from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { Text } from "@rneui/themed";

export default function SplashScreen() {
  return (
    <View style={styles.container}>
      <Text h1 style={styles.title}>WordVault</Text>
      <Text style={styles.subtitle}>look it up, babe</Text>
      <ActivityIndicator size="large" color="#a855f7" style={styles.spinner} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0a0a0a",
  },
  title: {
    color: "#a855f7",
    marginBottom: 4,
    letterSpacing: 2,
  },
  subtitle: {
    color: "#666",
    fontSize: 14,
    fontStyle: "italic",
    marginBottom: 32,
    letterSpacing: 1,
  },
  spinner: {
    marginTop: 8,
  },
});
