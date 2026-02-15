export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ERROR_MAP: Record<string, string> = {
  "Invalid login credentials":
    "Incorrect email or password. Please try again.",
  "Email not confirmed":
    "Please check your email and confirm your account first.",
  "User already registered":
    "An account with this email already exists. Try signing in instead.",
  "Password should be at least 6 characters":
    "Password must be at least 8 characters.",
  "Email rate limit exceeded":
    "Too many attempts. Please wait a few minutes before trying again.",
  "For security purposes, you can only request this after":
    "Please wait a moment before requesting another email.",
  "Unable to validate email address: invalid format":
    "Please enter a valid email address.",
};

export function friendlyAuthError(error: unknown): string {
  if (!error) return "An unexpected error occurred.";

  const message =
    error instanceof Error ? error.message : String(error);

  for (const [pattern, friendly] of Object.entries(ERROR_MAP)) {
    if (message.includes(pattern)) return friendly;
  }

  if (message.toLowerCase().includes("network"))
    return "Network error. Please check your connection and try again.";

  if (message.toLowerCase().includes("rate") || message.toLowerCase().includes("too many"))
    return "Too many attempts. Please wait a few minutes before trying again.";

  return "Something went wrong. Please try again.";
}

export function validatePassword(password: string): string | null {
  if (password.length < 8) return "Password must be at least 8 characters.";
  return null;
}

export function validateUsername(username: string): string | null {
  if (username.length < 3) return "Username must be at least 3 characters.";
  if (username.length > 20) return "Username must be 20 characters or fewer.";
  if (!/^[a-zA-Z0-9_]+$/.test(username))
    return "Only letters, numbers, and underscores allowed.";
  return null;
}
