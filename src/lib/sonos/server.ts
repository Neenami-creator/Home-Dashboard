import "server-only";

// Sonos Control API token exchange - a confidential-client OAuth2 flow,
// unlike Spotify's PKCE. UNVERIFIED FROM THIS BUILD ENVIRONMENT: the token
// endpoint path, the Basic-auth exchange shape, and the households/groups
// endpoints below are all built from documentation knowledge that could not
// be checked against a live Sonos developer account or real API responses
// here. Confirm against developer.sonos.com before relying on this - same
// caveat as the Hue event stream and BOM's undocumented endpoints, just
// with lower confidence than either since Sonos's Control API is the one
// integration in this app with no direct community-tool precedent to
// crib from.
const TOKEN_ENDPOINT = "https://api.sonos.com/login/v3/oauth/access";
export const SONOS_API_BASE = "https://api.ws.sonos.com/control/api/v1";

export type SonosTokenResponse = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
};

function credentials(): { clientId: string; clientSecret: string } | null {
  const clientId = process.env.NEXT_PUBLIC_SONOS_CLIENT_ID;
  const clientSecret = process.env.SONOS_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;
  return { clientId, clientSecret };
}

async function requestToken(params: Record<string, string>): Promise<SonosTokenResponse> {
  const creds = credentials();
  if (!creds) throw new Error("Sonos isn't configured on the server.");

  const basicAuth = Buffer.from(`${creds.clientId}:${creds.clientSecret}`).toString("base64");
  const res = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basicAuth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(params),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Sonos token exchange failed (${res.status}): ${body}`);
  }

  const json = (await res.json()) as {
    access_token: string;
    refresh_token: string;
    expires_in: number;
  };

  return {
    accessToken: json.access_token,
    refreshToken: json.refresh_token,
    expiresIn: json.expires_in,
  };
}

export function exchangeCode(code: string, redirectUri: string): Promise<SonosTokenResponse> {
  return requestToken({ grant_type: "authorization_code", code, redirect_uri: redirectUri });
}

export function refreshToken(token: string): Promise<SonosTokenResponse> {
  return requestToken({ grant_type: "refresh_token", refresh_token: token });
}
