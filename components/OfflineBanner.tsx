import { useEffect, useState } from "react";
import { View, StyleSheet, Platform } from "react-native";
import { Text } from "@rneui/themed";
import NetInfo from "@react-native-community/netinfo";
import { colors } from "../theme";

export default function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    if (Platform.OS === "web") {
      const update = () => setIsOffline(!navigator.onLine);
      window.addEventListener("online", update);
      window.addEventListener("offline", update);
      update();
      return () => {
        window.removeEventListener("online", update);
        window.removeEventListener("offline", update);
      };
    }

    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOffline(state.isConnected === false);
    });
    return unsubscribe;
  }, []);

  if (!isOffline) return null;

  return (
    <View style={styles.banner}>
      <Text style={styles.text}>You are offline</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: colors.blood,
    paddingVertical: 6,
    alignItems: "center",
  },
  text: {
    color: colors.bone,
    fontSize: 12,
    letterSpacing: 1,
  },
});
