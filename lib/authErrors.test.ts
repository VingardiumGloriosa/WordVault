import {
  EMAIL_REGEX,
  friendlyAuthError,
  validatePassword,
  validateUsername,
} from "./authErrors";

describe("EMAIL_REGEX", () => {
  it("accepts valid emails", () => {
    expect(EMAIL_REGEX.test("user@example.com")).toBe(true);
    expect(EMAIL_REGEX.test("a.b@domain.co")).toBe(true);
    expect(EMAIL_REGEX.test("test+tag@mail.org")).toBe(true);
  });

  it("rejects emails with single-char TLD", () => {
    expect(EMAIL_REGEX.test("a@b.c")).toBe(false);
  });

  it("rejects emails without @", () => {
    expect(EMAIL_REGEX.test("userexample.com")).toBe(false);
  });

  it("rejects empty string", () => {
    expect(EMAIL_REGEX.test("")).toBe(false);
  });

  it("rejects emails with spaces", () => {
    expect(EMAIL_REGEX.test("user @example.com")).toBe(false);
  });
});

describe("friendlyAuthError", () => {
  it("returns friendly message for known errors", () => {
    const err = new Error("Invalid login credentials");
    expect(friendlyAuthError(err)).toBe(
      "Incorrect email or password. Please try again.",
    );
  });

  it("catches network errors", () => {
    const err = new Error("Network request failed");
    expect(friendlyAuthError(err)).toContain("Network error");
  });

  it("catches rate limiting", () => {
    const err = new Error("Too many requests");
    expect(friendlyAuthError(err)).toContain("Too many attempts");
  });

  it("returns fallback for unknown errors", () => {
    const err = new Error("something random");
    expect(friendlyAuthError(err)).toBe("Something went wrong. Please try again.");
  });

  it("handles null/undefined", () => {
    expect(friendlyAuthError(null)).toBe("An unexpected error occurred.");
    expect(friendlyAuthError(undefined)).toBe("An unexpected error occurred.");
  });

  it("handles string errors", () => {
    expect(friendlyAuthError("Email rate limit exceeded")).toContain(
      "Too many attempts",
    );
  });
});

describe("validatePassword", () => {
  it("rejects short passwords", () => {
    expect(validatePassword("Ab1!")).not.toBeNull();
  });

  it("rejects passwords without uppercase", () => {
    expect(validatePassword("abcdefg1!")).not.toBeNull();
  });

  it("rejects passwords without number", () => {
    expect(validatePassword("Abcdefgh!")).not.toBeNull();
  });

  it("rejects passwords without special character", () => {
    expect(validatePassword("Abcdefg1")).not.toBeNull();
  });

  it("accepts strong passwords", () => {
    expect(validatePassword("Abcdefg1!")).toBeNull();
  });
});

describe("validateUsername", () => {
  it("rejects too short", () => {
    expect(validateUsername("ab")).not.toBeNull();
  });

  it("rejects too long", () => {
    expect(validateUsername("a".repeat(21))).not.toBeNull();
  });

  it("rejects special characters", () => {
    expect(validateUsername("user@name")).not.toBeNull();
  });

  it("accepts valid usernames", () => {
    expect(validateUsername("user_123")).toBeNull();
    expect(validateUsername("abc")).toBeNull();
  });
});
