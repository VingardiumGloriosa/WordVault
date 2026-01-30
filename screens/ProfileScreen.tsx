import { View } from "react-native";
import { useAuth } from "../auth/AuthProvider";
import Account from "../components/Account";

export default function ProfileScreen() {
  const { session } = useAuth();
  return <Account session={session} />;
}
