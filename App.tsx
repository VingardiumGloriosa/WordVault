import React from "react";
import { NavigationContainer, DarkTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ThemeProvider, createTheme } from "@rneui/themed";
import { AuthProvider } from "./auth/AuthProvider";

import SplashScreen from "./screens/SplashScreen";
import SignInScreen from "./screens/SignInScreen";
import AppTabs from "./navigation/AppTabs";

import { useIsSignedIn, useIsSignedOut } from "./auth/AuthHooks";

const gothNavTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: "#0a0a0a",
    card: "#111",
    text: "#d4d4d4",
    border: "#2a1545",
    primary: "#a855f7",
  },
};

const rneuiTheme = createTheme({
  darkColors: {
    primary: "#a855f7",
    secondary: "#dc2626",
    background: "#0a0a0a",
  },
  mode: "dark",
});

const Stack = createNativeStackNavigator();

function RootNavigator() {
  const isSignedIn = useIsSignedIn();
  const isSignedOut = useIsSignedOut();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: "#111" },
        headerTintColor: "#a855f7",
        headerTitleStyle: { color: "#d4d4d4" },
      }}
    >
      {!isSignedIn && !isSignedOut && (
        <Stack.Screen
          name="Splash"
          component={SplashScreen}
          options={{ headerShown: false }}
        />
      )}

      {isSignedOut && (
        <Stack.Screen
          name="SignIn"
          component={SignInScreen}
          options={{ headerShown: false }}
        />
      )}

      {isSignedIn && (
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
  return (
    <ThemeProvider theme={rneuiTheme}>
      <AuthProvider>
        <NavigationContainer theme={gothNavTheme}>
          <RootNavigator />
        </NavigationContainer>
      </AuthProvider>
    </ThemeProvider>
  );
}
