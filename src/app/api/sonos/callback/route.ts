import { NextRequest, NextResponse } from "next/server";
import { exchangeCode } from "@/lib/sonos/server";

// Sonos's confidential-client flow means the code exchange has to happen
// here (server-only client secret), not in the browser like Spotify's PKCE
// flow. Since there's no server-side session/database to hand the result
// to, the tokens are passed back to the browser via the URL *fragment*
// (never sent to a server on the following request, unlike a query string)
// for a client script to pick up and store in localStorage.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(`${origin}/spotify?sonos_error=${encodeURIComponent(error)}`);
  }
  if (!code) {
    return NextResponse.redirect(`${origin}/spotify?sonos_error=missing_code`);
  }

  try {
    const tokens = await exchangeCode(code, `${origin}/api/sonos/callback`);
    const fragment = new URLSearchParams({
      sonos_access_token: tokens.accessToken,
      sonos_refresh_token: tokens.refreshToken,
      sonos_expires_in: String(tokens.expiresIn),
    });
    return NextResponse.redirect(`${origin}/spotify#${fragment.toString()}`);
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown_error";
    return NextResponse.redirect(`${origin}/spotify?sonos_error=${encodeURIComponent(message)}`);
  }
}
