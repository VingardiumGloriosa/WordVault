import React from "react";
import { NavigationContainer, DarkTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ThemeProvider, createTheme } from "@rneui/themed";
import { AuthProvider } from "./auth/AuthProvider";
import { colors } from "./theme";

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
        headerTitleStyle: { color: colors.bone },
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
  return (
    <ThemeProvider theme={rneuiTheme}>
      <AuthProvider>
        <NavigationContainer theme={navTheme}>
          <RootNavigator />
        </NavigationContainer>
      </AuthProvider>
    </ThemeProvider>
  );
}
