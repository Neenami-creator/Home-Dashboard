import { NextRequest, NextResponse } from "next/server";
import type { CityWeather, CurrentConditions, ForecastDay } from "@/lib/weather/types";

// BOM has no documented, key-based API. This proxies its public JSON
// mirrors of the FTP product files that community weather tools already
// parse (see README for how these product/station/AAC codes are found).
// Running this server-side avoids both CORS (bom.gov.au doesn't send
// permissive headers) and exposes a stable shape to the client even if
// BOM's own JSON structure shifts slightly.

const USER_AGENT = "HomeDashboard/1.0 (personal wall-mounted dashboard)";

async function fetchBomJson(url: string): Promise<unknown> {
  const res = await fetch(url, {
    headers: { "User-Agent": USER_AGENT },
    next: { revalidate: 300 },
  });
  if (!res.ok) {
    throw new Error(`BOM returned ${res.status} for ${url}`);
  }
  return res.json();
}

function parseObservation(raw: unknown): CurrentConditions | null {
  const data = (raw as { observations?: { data?: unknown[] } })?.observations?.data;
  if (!Array.isArray(data) || data.length === 0) return null;

  const latest = data[0] as Record<string, unknown>;
  const num = (v: unknown): number | null => (typeof v === "number" ? v : null);
  const str = (v: unknown): string | null => (typeof v === "string" ? v : null);

  return {
    stationName: str(latest.name) ?? "Unknown station",
    observedAt: str(latest.local_date_time) ?? "",
    airTempC: num(latest.air_temp),
    feelsLikeC: num(latest.apparent_t),
    humidityPercent: num(latest.rel_hum),
    windDirection: str(latest.wind_dir),
    windSpeedKmh: num(latest.wind_spd_kmh),
    gustKmh: num(latest.gust_kmh),
    conditionText: str(latest.weather),
  };
}

function parseForecast(raw: unknown): ForecastDay[] {
  const areas = (
    raw as {
      product?: { forecast?: { area?: unknown[] } };
    }
  )?.product?.forecast?.area;
  if (!Array.isArray(areas)) return [];

  // The location-level area (as opposed to sub-region areas) carries the
  // forecast-period list we want; it's the one with a "aac" matching the
  // requested code, but in practice it's simplest to take the first area
  // that actually has forecast periods.
  const area = areas.find(
    (a) => Array.isArray((a as { ["forecast-period"]?: unknown[] })["forecast-period"])
  ) as { ["forecast-period"]?: Record<string, unknown>[] } | undefined;
  const periods = area?.["forecast-period"] ?? [];

  return periods.map((period): ForecastDay => {
    const elements = Array.isArray(period.element)
      ? (period.element as Record<string, unknown>[])
      : [];
    const find = (type: string) => elements.find((e) => e.type === type);
    const text = (type: string): string | null => {
      const el = find(type);
      const value = el?.["#text"] ?? el?.text;
      return typeof value === "string" ? value : null;
    };
    const number = (type: string): number | null => {
      const value = text(type);
      if (value === null) return null;
      const parsed = parseFloat(value.replace(/[^\d.-]/g, ""));
      return Number.isNaN(parsed) ? null : parsed;
    };

    return {
      date: typeof period["start-time-local"] === "string" ? period["start-time-local"] : "",
      precis: text("precis") ?? "",
      minTempC: number("air_temperature_minimum"),
      maxTempC: number("air_temperature_maximum"),
      chanceOfRainPercent: number("probability_of_precipitation"),
    };
  });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const obsProduct = searchParams.get("obsProduct");
  const obsStation = searchParams.get("obsStation");
  const fcProduct = searchParams.get("fcProduct");
  const fcAac = searchParams.get("fcAac");

  if (!obsProduct || !obsStation || !fcProduct || !fcAac) {
    return NextResponse.json(
      { error: "Missing one of obsProduct, obsStation, fcProduct, fcAac" },
      { status: 400 }
    );
  }

  const obsUrl = `https://www.bom.gov.au/fwo/${obsProduct}/${obsProduct}.${obsStation}.json`;
  const fcUrl = `https://www.bom.gov.au/fwo/${fcProduct}/${fcProduct}.${fcAac}.json`;

  const warnings: string[] = [];
  let current: CurrentConditions | null = null;
  let forecast: ForecastDay[] = [];

  const [obsResult, fcResult] = await Promise.allSettled([
    fetchBomJson(obsUrl),
    fetchBomJson(fcUrl),
  ]);

  if (obsResult.status === "fulfilled") {
    current = parseObservation(obsResult.value);
    if (!current) warnings.push("Couldn't find current conditions in BOM's response.");
  } else {
    warnings.push(`Current conditions unavailable: ${obsResult.reason}`);
  }

  if (fcResult.status === "fulfilled") {
    forecast = parseForecast(fcResult.value);
    if (forecast.length === 0) warnings.push("Couldn't find a forecast in BOM's response.");
  } else {
    warnings.push(`Forecast unavailable: ${fcResult.reason}`);
  }

  const body: CityWeather = { current, forecast, warnings };
  return NextResponse.json(body);
}
