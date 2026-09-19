import { NextRequest, NextResponse } from "next/server";

// BOM's radar imagery has no JSON API either - this scrapes the frame
// timestamps out of the public loop page's embedded JavaScript, the same
// technique long-standing community BOM radar tools use. It's the least
// stable integration in this app by nature (an HTML scrape, not even an
// undocumented-but-stable JSON endpoint like the rest of the weather
// panel) - see the README before relying on it.
const USER_AGENT = "HomeDashboard/1.0 (personal wall-mounted dashboard)";
const FRAME_COUNT = 6;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const radarId = searchParams.get("radarId");
  if (!radarId) {
    return NextResponse.json({ error: "Missing radarId" }, { status: 400 });
  }

  const loopUrl = `http://www.bom.gov.au/products/${radarId}.loop.shtml`;

  try {
    const res = await fetch(loopUrl, { headers: { "User-Agent": USER_AGENT }, next: { revalidate: 300 } });
    if (!res.ok) throw new Error(`BOM returned ${res.status}`);
    const html = await res.text();

    // Frame timestamps appear as 14-digit YYYYMMDDHHmm strings in the
    // page's embedded frame array.
    const matches = [...html.matchAll(/\b(\d{14})\b/g)].map((m) => m[1]);
    const uniqueTimestamps = [...new Set(matches)].sort();
    const recent = uniqueTimestamps.slice(-FRAME_COUNT);

    if (recent.length === 0) {
      return NextResponse.json({
        background: `http://www.bom.gov.au/radar/${radarId}.background.png`,
        topography: `http://www.bom.gov.au/radar/${radarId}.topography.png`,
        locations: `http://www.bom.gov.au/radar/${radarId}.locations.png`,
        range: `http://www.bom.gov.au/radar/${radarId}.range.png`,
        frames: [],
        warning: "Couldn't find current radar frames - showing the map without a rain overlay.",
      });
    }

    return NextResponse.json({
      background: `http://www.bom.gov.au/radar/${radarId}.background.png`,
      topography: `http://www.bom.gov.au/radar/${radarId}.topography.png`,
      locations: `http://www.bom.gov.au/radar/${radarId}.locations.png`,
      range: `http://www.bom.gov.au/radar/${radarId}.range.png`,
      frames: recent.map((t) => `http://www.bom.gov.au/radar/${radarId}.T.${t}.png`),
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Couldn't load radar." },
      { status: 502 }
    );
  }
}
