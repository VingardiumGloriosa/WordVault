import { Platform } from "react-native";
import * as Linking from "expo-linking";
import { createClient } from "@supabase/supabase-js";
import { secureStorage } from "./secureStorage";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabasePublishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const supabase = createClient(supabaseUrl!, supabasePublishableKey!, {
  auth: {
    storage: secureStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === "web",
  },
});

export function getAuthRedirectUrl(): string {
  return Linking.createURL("auth-callback");
}
