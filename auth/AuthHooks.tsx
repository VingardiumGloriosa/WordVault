import { useAuth } from "./AuthProvider";

export function useIsSignedIn() {
  const { session } = useAuth();
  return !!session;
}

export function useIsSignedOut() {
  return !useIsSignedIn();
}
