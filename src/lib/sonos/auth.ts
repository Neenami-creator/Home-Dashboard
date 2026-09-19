"use client";

import { loadTokens, saveTokens, saveOAuthState, clientId } from "./config";

const AUTH_ENDPOINT = "https://api.sonos.com/login/v3/oauth";
// Sonos's Control API access tokens are short-lived; refresh a little early
// so a control tap never lands right on the expiry boundary.
const REFRESH_MARGIN_MS = 60_000;

function randomState(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function redirectUri(): string {
  return `${window.location.origin}/api/sonos/callback`;
}

export function startAuthFlow(): void {
  const id = clientId();
  if (!id) return;
  const state = randomState();
  saveOAuthState(state);

  const params = new URLSearchParams({
    client_id: id,
    response_type: "code",
    state,
    scope: "playback-control-all",
    redirect_uri: redirectUri(),
  });

  // External navigation to Sonos's own login page, not an internal route.
  // eslint-disable-next-line @next/next/no-location-assign-relative-destination
  window.location.href = `${AUTH_ENDPOINT}?${params.toString()}`;
}

// The Sonos Control API's token exchange requires a client secret (it's a
// confidential client, unlike Spotify's PKCE public client) - refreshing
// has to go through our own server route, which is the only place that
// secret is ever held.
export async function getValidAccessToken(): Promise<string | null> {
  const tokens = loadTokens();
  if (!tokens) return null;

  if (Date.now() < tokens.expiresAt - REFRESH_MARGIN_MS) {
    return tokens.accessToken;
  }

  try {
    const res = await fetch("/api/sonos/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: tokens.refreshToken }),
    });
    if (!res.ok) throw new Error("refresh failed");
    const refreshed = (await res.json()) as {
      accessToken: string;
      refreshToken: string;
      expiresIn: number;
    };
    const next = {
      accessToken: refreshed.accessToken,
      refreshToken: refreshed.refreshToken,
      expiresAt: Date.now() + refreshed.expiresIn * 1000,
    };
    saveTokens(next);
    return next.accessToken;
  } catch {
    return null;
  }
}
