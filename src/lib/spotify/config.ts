"use client";

import type { SpotifyTokens } from "./types";

const CLIENT_ID_KEY = "spotify-client-id";
const TOKENS_KEY = "spotify-tokens";
const PKCE_VERIFIER_KEY = "spotify-pkce-verifier";
const PKCE_STATE_KEY = "spotify-pkce-state";

export function loadClientId(): string | null {
  if (typeof window === "undefined") return null;
  const stored = window.localStorage.getItem(CLIENT_ID_KEY);
  if (stored) return stored;
  return process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID ?? null;
}

export function saveClientId(clientId: string) {
  window.localStorage.setItem(CLIENT_ID_KEY, clientId);
}

export function loadTokens(): SpotifyTokens | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = window.localStorage.getItem(TOKENS_KEY);
    return stored ? (JSON.parse(stored) as SpotifyTokens) : null;
  } catch {
    return null;
  }
}

export function saveTokens(tokens: SpotifyTokens) {
  window.localStorage.setItem(TOKENS_KEY, JSON.stringify(tokens));
}

export function clearTokens() {
  window.localStorage.removeItem(TOKENS_KEY);
}

// The PKCE verifier/state only need to survive the redirect round-trip to
// Spotify and back, so sessionStorage (not localStorage) is enough.
export function savePkceParams(verifier: string, state: string) {
  window.sessionStorage.setItem(PKCE_VERIFIER_KEY, verifier);
  window.sessionStorage.setItem(PKCE_STATE_KEY, state);
}

export function loadPkceParams(): { verifier: string; state: string } | null {
  const verifier = window.sessionStorage.getItem(PKCE_VERIFIER_KEY);
  const state = window.sessionStorage.getItem(PKCE_STATE_KEY);
  if (!verifier || !state) return null;
  return { verifier, state };
}

export function clearPkceParams() {
  window.sessionStorage.removeItem(PKCE_VERIFIER_KEY);
  window.sessionStorage.removeItem(PKCE_STATE_KEY);
}

export function redirectUri(): string {
  return `${window.location.origin}/spotify/callback`;
}
