import React, { useEffect } from "react";
import { Platform } from "react-native";
import { NavigationContainer, DarkTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ThemeProvider, createTheme } from "@rneui/themed";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthProvider } from "./auth/AuthProvider";
import { Analytics } from "@vercel/analytics/react";
import OfflineBanner from "./components/OfflineBanner";
import { colors, fonts } from "./theme";

import SplashScreen from "./screens/SplashScreen";
import AppTabs from "./navigation/AppTabs";

import { useAuthLoading } from "./auth/AuthHooks";

const navTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.void,
    card: colors.obsidian,
    text: colors.bone,
    border: colors.charcoal,
    primary: colors.ember,
  },
};

const rneuiTheme = createTheme({
  darkColors: {
    primary: colors.ember,
    secondary: colors.wine,
    background: colors.void,
  },
  mode: "dark",
});

const Stack = createNativeStackNavigator();

function RootNavigator() {
  const loading = useAuthLoading();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.obsidian },
        headerTintColor: colors.ember,
        headerTitleStyle: { color: colors.bone, fontFamily: fonts.body },
      }}
    >
      {loading ? (
        <Stack.Screen
          name="Splash"
          component={SplashScreen}
          options={{ headerShown: false }}
        />
      ) : (
        <Stack.Screen
          name="App"
          component={AppTabs}
          options={{ headerShown: false }}
        />
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  useEffect(() => {
    if (Platform.OS === "web" && typeof document !== "undefined") {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://fonts.googleapis.com/css2?family=Cormorant+Unicase:wght@300;500;700&family=Libre+Caslon+Text:ital,wght@0,400;0,700;1,400&display=swap";
      document.head.appendChild(link);

      const style = document.createElement("style");
      style.textContent = [
        `*:focus-visible { outline: 2px solid ${colors.ember}; outline-offset: 2px; }`,
        `[role="button"], button, a { cursor: pointer; }`,
        `[role="button"]:hover, button:hover { opacity: 0.85; }`,
        `[data-card]:hover { border-color: ${colors.ghost} !important; }`,
      ].join("\n");
      document.head.appendChild(style);
      return () => {
        document.head.removeChild(link);
        document.head.removeChild(style);
      };
    }
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider theme={rneuiTheme}>
        <AuthProvider>
          <OfflineBanner />
          <NavigationContainer theme={navTheme}>
            <RootNavigator />
          </NavigationContainer>
        </AuthProvider>
      </ThemeProvider>
      <Analytics />
    </GestureHandlerRootView>
  );
}
