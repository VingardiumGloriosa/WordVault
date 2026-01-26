import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AuthProvider } from "./auth/AuthProvider";

import SplashScreen from "./screens/SplashScreen";
import SignInScreen from "./screens/SignInScreen";
import HomeScreen from "./screens/HomeScreen";

import { useIsSignedIn, useIsSignedOut } from "./auth/AuthHooks";

const Stack = createNativeStackNavigator();

function RootNavigator() {
  const isSignedIn = useIsSignedIn();
  const isSignedOut = useIsSignedOut();

  return (
    <Stack.Navigator>
      {/* while loading session, we could show Splash */}
      {!isSignedIn && !isSignedOut && (
        <Stack.Screen
          name="Splash"
          component={SplashScreen}
          options={{ headerShown: false }}
        />
      )}

      {/* Signed Out */}
      {isSignedOut && (
        <Stack.Screen
          name="SignIn"
          component={SignInScreen}
          options={{ title: "Log In" }}
        />
      )}

      {/* Signed In */}
      {isSignedIn && (
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: "Welcome" }}
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
