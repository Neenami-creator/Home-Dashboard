import { NextRequest, NextResponse } from "next/server";
import { refreshToken as refreshSonosToken } from "@/lib/sonos/server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  if (typeof body.refreshToken !== "string") {
    return NextResponse.json({ error: "Missing refreshToken." }, { status: 400 });
  }

  try {
    const tokens = await refreshSonosToken(body.refreshToken);
    return NextResponse.json(tokens);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Couldn't refresh." },
      { status: 502 }
    );
  }
}
