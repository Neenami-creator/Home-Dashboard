// Edge-safe (Web Crypto, no Node `crypto` module) since this is imported by
// both middleware (always Edge runtime) and the unlock API route.
const COOKIE_NAME = "dashboard_session";
const UNLOCK_MESSAGE = "home-dashboard-unlocked";

async function hmac(secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(UNLOCK_MESSAGE));
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function computeSessionToken(secret: string): Promise<string> {
  return hmac(secret);
}

export async function isValidSessionToken(token: string | undefined, secret: string): Promise<boolean> {
  if (!token) return false;
  const expected = await hmac(secret);
  // Lengths are fixed/equal (both hex-encoded SHA-256), so a simple
  // constant-time-ish comparison is enough for a single-household PIN gate.
  if (token.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < token.length; i++) diff |= token.charCodeAt(i) ^ expected.charCodeAt(i);
  return diff === 0;
}

export { COOKIE_NAME };
