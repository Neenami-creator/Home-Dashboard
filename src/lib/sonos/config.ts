"use client";

import type { SonosTokens } from "./types";

const TOKENS_KEY = "sonos-tokens";
const STATE_KEY = "sonos-oauth-state";

export function loadTokens(): SonosTokens | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = window.localStorage.getItem(TOKENS_KEY);
    return stored ? (JSON.parse(stored) as SonosTokens) : null;
  } catch {
    return null;
  }
}

export function saveTokens(tokens: SonosTokens): void {
  window.localStorage.setItem(TOKENS_KEY, JSON.stringify(tokens));
}

export function clearTokens(): void {
  window.localStorage.removeItem(TOKENS_KEY);
}

export function isConnected(): boolean {
  return loadTokens() !== null;
}

export function saveOAuthState(state: string): void {
  window.sessionStorage.setItem(STATE_KEY, state);
}

export function consumeOAuthState(): string | null {
  const state = window.sessionStorage.getItem(STATE_KEY);
  window.sessionStorage.removeItem(STATE_KEY);
  return state;
}

export function clientId(): string | null {
  return process.env.NEXT_PUBLIC_SONOS_CLIENT_ID ?? null;
}
