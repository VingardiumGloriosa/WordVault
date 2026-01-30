import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AuthProvider } from "./auth/AuthProvider";

import SplashScreen from "./screens/SplashScreen";
import SignInScreen from "./screens/SignInScreen";
import AppTabs from "./navigation/AppTabs";

import { useIsSignedIn, useIsSignedOut } from "./auth/AuthHooks";

const Stack = createNativeStackNavigator();

function RootNavigator() {
  const isSignedIn = useIsSignedIn();
  const isSignedOut = useIsSignedOut();

  return (
    <Stack.Navigator>
      {}
      {!isSignedIn && !isSignedOut && (
        <Stack.Screen
          name="Splash"
          component={SplashScreen}
          options={{ headerShown: false }}
        />
      )}

      {}
      {isSignedOut && (
        <Stack.Screen
          name="SignIn"
          component={SignInScreen}
          options={{ title: "Log In" }}
        />
      )}

      {}
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
    <AuthProvider>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}
