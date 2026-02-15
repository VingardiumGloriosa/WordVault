import { useAuth } from "./AuthProvider";

export function useIsSignedIn() {
  const { session } = useAuth();
  return !!session;
}

export function useIsSignedOut() {
  return !useIsSignedIn();
}

export function useAuthLoading() {
  const { loading } = useAuth();
  return loading;
}

export function useIsRecoveryFlow() {
  const { isRecoveryFlow } = useAuth();
  return isRecoveryFlow;
}
