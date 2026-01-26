import React from "react";
import { View } from "react-native";
import { useAuth } from "../auth/AuthProvider";
import Account from "../components/Account";

export default function HomeScreen() {
  const { session } = useAuth();

  return (
    <View>
      <Account key={session.user.id} session={session} />
    </View>
  );
}
