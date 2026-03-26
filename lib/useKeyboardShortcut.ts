import { useEffect } from "react";
import { Platform } from "react-native";

type Options = {
  ctrl?: boolean;
  meta?: boolean;
  preventDefault?: boolean;
};

export function useKeyboardShortcut(
  key: string,
  callback: () => void,
  options?: Options,
): void {
  useEffect(() => {
    if (Platform.OS !== "web" || typeof window === "undefined") return;

    const handler = (e: KeyboardEvent) => {
      if (options?.ctrl && !e.ctrlKey && !e.metaKey) return;
      if (options?.meta && !e.metaKey) return;

      // Don't trigger shortcuts when typing in input fields (unless it's a modifier shortcut)
      const target = e.target as HTMLElement | null;
      const isInput = target?.tagName === "INPUT" || target?.tagName === "TEXTAREA" || target?.isContentEditable;
      if (isInput && !options?.ctrl && !options?.meta && key !== "Escape") return;

      if (e.key === key || e.key === key.toUpperCase()) {
        if (options?.preventDefault !== false) e.preventDefault();
        callback();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [key, callback, options?.ctrl, options?.meta, options?.preventDefault]);
}
