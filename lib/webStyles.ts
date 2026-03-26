import { Platform } from "react-native";

export const webCursor = Platform.OS === "web" ? { cursor: "pointer" as const } : {};
