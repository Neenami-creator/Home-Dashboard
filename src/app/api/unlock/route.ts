import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAME, computeSessionToken } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  const pin = process.env.DASHBOARD_PIN;
  const secret = process.env.DASHBOARD_SESSION_SECRET;
  if (!pin || !secret) {
    return NextResponse.json({ error: "The dashboard PIN isn't configured." }, { status: 500 });
  }

  const body = await request.json();
  if (body.pin !== pin) {
    return NextResponse.json({ error: "Wrong PIN." }, { status: 401 });
  }

  const token = await computeSessionToken(secret);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    // A year - this is a fixed wall-mounted device, not a shared browser
    // that needs re-locking after a session.
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });
  return response;
}
