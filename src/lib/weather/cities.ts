"use client";

import type { WeatherCity } from "./types";

const STORAGE_KEY = "weather-custom-cities";
const SELECTED_KEY = "weather-selected-city";

// The one city verified against BOM's actual JSON output. Everything else
// (Roxby Downs, Whyalla, ...) is added by the household via the panel's
// "add a city" form, since BOM publishes no directory of these codes and
// guessing them risks silently showing the wrong town's weather.
export const BUILT_IN_CITIES: WeatherCity[] = [
  {
    id: "adelaide",
    name: "Adelaide",
    obsProduct: "IDS60901",
    obsStation: "94648",
    fcProduct: "IDS10044",
    fcAac: "SA_PW001",
    builtIn: true,
  },
];

export function loadCities(): WeatherCity[] {
  if (typeof window === "undefined") return BUILT_IN_CITIES;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const custom = stored ? (JSON.parse(stored) as WeatherCity[]) : [];
    return [...BUILT_IN_CITIES, ...custom];
  } catch {
    return BUILT_IN_CITIES;
  }
}

export function addCity(city: Omit<WeatherCity, "builtIn">) {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  const custom: WeatherCity[] = stored ? JSON.parse(stored) : [];
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...custom, city]));
}

export function removeCity(id: string) {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  const custom: WeatherCity[] = stored ? JSON.parse(stored) : [];
  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(custom.filter((c) => c.id !== id))
  );
}

export function loadSelectedCityId(): string {
  if (typeof window === "undefined") return BUILT_IN_CITIES[0].id;
  return window.localStorage.getItem(SELECTED_KEY) ?? BUILT_IN_CITIES[0].id;
}

export function saveSelectedCityId(id: string) {
  window.localStorage.setItem(SELECTED_KEY, id);
}
