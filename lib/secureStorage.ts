import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

const CHUNK_SIZE = 1800;

function chunkedKey(key: string, index: number) {
  return `${key}__chunk_${index}`;
}

async function nativeSetItem(key: string, value: string): Promise<void> {
  // Clean up any existing chunks before writing
  await cleanupChunks(key);

  if (value.length <= CHUNK_SIZE) {
    await SecureStore.setItemAsync(key, value);
    return;
  }
  const chunks = Math.ceil(value.length / CHUNK_SIZE);
  await SecureStore.setItemAsync(key, `__chunked__:${chunks}`);
  for (let i = 0; i < chunks; i++) {
    await SecureStore.setItemAsync(
      chunkedKey(key, i),
      value.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE),
    );
  }
}

async function cleanupChunks(key: string): Promise<void> {
  try {
    const raw = await SecureStore.getItemAsync(key);
    if (raw !== null && raw.startsWith("__chunked__:")) {
      const count = parseInt(raw.split(":")[1], 10);
      if (!isNaN(count)) {
        for (let i = 0; i < count; i++) {
          await SecureStore.deleteItemAsync(chunkedKey(key, i));
        }
      }
    }
  } catch {
    // Best-effort cleanup
  }
}

async function nativeGetItem(key: string): Promise<string | null> {
  const raw = await SecureStore.getItemAsync(key);
  if (raw === null) return null;
  if (!raw.startsWith("__chunked__:")) return raw;
  const count = parseInt(raw.split(":")[1], 10);
  const parts: string[] = [];
  for (let i = 0; i < count; i++) {
    const chunk = await SecureStore.getItemAsync(chunkedKey(key, i));
    if (chunk === null) return null;
    parts.push(chunk);
  }
  return parts.join("");
}

async function nativeRemoveItem(key: string): Promise<void> {
  const raw = await SecureStore.getItemAsync(key);
  if (raw !== null && raw.startsWith("__chunked__:")) {
    const count = parseInt(raw.split(":")[1], 10);
    for (let i = 0; i < count; i++) {
      await SecureStore.deleteItemAsync(chunkedKey(key, i));
    }
  }
  await SecureStore.deleteItemAsync(key);
}

// Use sessionStorage on web — tokens are cleared when the tab closes,
// reducing exposure compared to localStorage (which persists indefinitely
// and is accessible to any script on the page via XSS).
const webStorage = {
  getItem(key: string) {
    if (typeof sessionStorage === "undefined") return null;
    return sessionStorage.getItem(key);
  },
  setItem(key: string, value: string) {
    sessionStorage.setItem(key, value);
  },
  removeItem(key: string) {
    sessionStorage.removeItem(key);
  },
};

export const secureStorage =
  Platform.OS === "web"
    ? webStorage
    : {
        getItem: nativeGetItem,
        setItem: nativeSetItem,
        removeItem: nativeRemoveItem,
      };
