"use client";

import { generateCodeChallenge, generateCodeVerifier, generateState } from "./pkce";
import { redirectUri, savePkceParams, loadPkceParams, clearPkceParams, saveTokens, loadTokens, clearTokens } from "./config";
import type { SpotifyTokens } from "./types";

const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
const TOKEN_ENDPOINT = "https://accounts.spotify.com/api/token";

// Transport controls need these three; nothing here ever needs a client
// secret since this is the PKCE flow.
const SCOPES = [
  "user-read-playback-state",
  "user-modify-playback-state",
  "user-read-currently-playing",
].join(" ");

export class SpotifyAuthError extends Error {}

export async function startAuthFlow(clientId: string): Promise<void> {
  const verifier = generateCodeVerifier();
  const challenge = await generateCodeChallenge(verifier);
  const state = generateState();
  savePkceParams(verifier, state);

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    redirect_uri: redirectUri(),
    scope: SCOPES,
    code_challenge_method: "S256",
    code_challenge: challenge,
    state,
  });

  // External navigation to Spotify's own auth page, not an internal route.
  // eslint-disable-next-line @next/next/no-location-assign-relative-destination
  window.location.href = `${AUTH_ENDPOINT}?${params.toString()}`;
}

export async function completeAuthFlow(
  clientId: string,
  code: string,
  state: string
): Promise<SpotifyTokens> {
  const pkce = loadPkceParams();
  if (!pkce || pkce.state !== state) {
    throw new SpotifyAuthError("Login expired or was tampered with. Please try connecting again.");
  }
  clearPkceParams();

  const tokens = await requestToken({
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri(),
    client_id: clientId,
    code_verifier: pkce.verifier,
  });
  saveTokens(tokens);
  return tokens;
}

async function requestToken(params: Record<string, string>): Promise<SpotifyTokens> {
  const res = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(params),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new SpotifyAuthError(`Spotify login failed: ${body}`);
  }

  const json = (await res.json()) as {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
  };

  return {
    accessToken: json.access_token,
    refreshToken: json.refresh_token ?? params.refresh_token ?? "",
    expiresAt: Date.now() + json.expires_in * 1000,
  };
}

// Spotify access tokens last an hour; refresh a little early so a control
// tap never lands right on the expiry boundary.
const REFRESH_MARGIN_MS = 60_000;

export async function getValidAccessToken(clientId: string): Promise<string | null> {
  const tokens = loadTokens();
  if (!tokens) return null;

  if (Date.now() < tokens.expiresAt - REFRESH_MARGIN_MS) {
    return tokens.accessToken;
  }

  try {
    const refreshed = await requestToken({
      grant_type: "refresh_token",
      refresh_token: tokens.refreshToken,
      client_id: clientId,
    });
    saveTokens(refreshed);
    return refreshed.accessToken;
  } catch {
    clearTokens();
    return null;
  }
}

export function disconnect() {
  clearTokens();
}

export function isConnected(): boolean {
  return loadTokens() !== null;
}
