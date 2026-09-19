import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAME, isValidSessionToken } from "@/lib/auth/session";

// Optional: if DASHBOARD_PIN isn't configured, the dashboard stays open (the
// original behavior) rather than locking someone out of their own
// deployment. Once set, every route except the unlock flow and static
// assets requires the PIN once per device - this is what actually stops a
// stranger who finds the Vercel URL from toggling your lights.
export async function middleware(request: NextRequest) {
  const pin = process.env.DASHBOARD_PIN;
  const secret = process.env.DASHBOARD_SESSION_SECRET;
  if (!pin || !secret) return NextResponse.next();

  const { pathname } = request.nextUrl;
  if (
    pathname.startsWith("/unlock") ||
    pathname.startsWith("/api/unlock") ||
    pathname.startsWith("/_next") ||
    pathname === "/manifest.json" ||
    pathname === "/sw.js" ||
    pathname === "/favicon.ico" ||
    /\.(png|jpg|jpeg|svg|ico|webp)$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  const valid = await isValidSessionToken(request.cookies.get(COOKIE_NAME)?.value, secret);
  if (valid) return NextResponse.next();

  const unlockUrl = new URL("/unlock", request.url);
  unlockUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(unlockUrl);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
