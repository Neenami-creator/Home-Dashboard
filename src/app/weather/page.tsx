"use client";

import { useCallback, useEffect, useState, type CSSProperties } from "react";
import { PanelShell } from "@/components/PanelShell";
import { CitySelector } from "@/components/weather/CitySelector";
import { AddCityForm } from "@/components/weather/AddCityForm";
import { ConditionsCard } from "@/components/weather/ConditionsCard";
import { ForecastStrip } from "@/components/weather/ForecastStrip";
import { RadarLoop } from "@/components/weather/RadarLoop";
import { StaleBadge } from "@/components/ui/StaleBadge";
import {
  loadCities,
  loadSelectedCityId,
  saveSelectedCityId,
  addCity,
  removeCity,
} from "@/lib/weather/cities";
import { fetchCityWeather } from "@/lib/weather/client";
import { loadCache, saveCache } from "@/lib/cache";
import type { CityWeather, WeatherCity } from "@/lib/weather/types";

const POLL_INTERVAL_MS = 10 * 60 * 1000;

export default function WeatherPage() {
  const [cities, setCities] = useState<WeatherCity[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [weather, setWeather] = useState<CityWeather | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAddCity, setShowAddCity] = useState(false);
  const [staleSince, setStaleSince] = useState<number | null>(null);

  useEffect(() => {
    // Reads localStorage, which isn't available during server rendering.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCities(loadCities());
    setSelectedId(loadSelectedCityId());
  }, []);

  const selectedCity = cities.find((c) => c.id === selectedId) ?? null;

  const refresh = useCallback(async (city: WeatherCity) => {
    try {
      const result = await fetchCityWeather(city);
      setWeather(result);
      setError(null);
      setStaleSince(null);
      saveCache(`weather-${city.id}`, result);
    } catch (err) {
      // The wall UI never shows raw fetch/HTTP detail (see render below) -
      // that detail is only useful for debugging, so it goes to the console.
      console.error("Weather refresh failed:", err);
      setError(err instanceof Error ? err.message : "Couldn't load the weather.");
      // Cold load with no data yet for this city - fall back to whatever we
      // last knew rather than showing nothing.
      setWeather((prev) => {
        if (prev) return prev;
        const cached = loadCache<CityWeather>(`weather-${city.id}`);
        if (cached) setStaleSince(cached.savedAt);
        return cached?.data ?? prev;
      });
    }
  }, []);

  useEffect(() => {
    if (!selectedCity) return;
    // Fetches weather for the selected city on mount and on an interval.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setWeather(null);
    setStaleSince(null);
    refresh(selectedCity);
    const interval = setInterval(() => refresh(selectedCity), POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [selectedCity, refresh]);

  function handleSelect(id: string) {
    setSelectedId(id);
    saveSelectedCityId(id);
  }

  function handleAddCity(city: Omit<WeatherCity, "builtIn">) {
    addCity(city);
    setCities(loadCities());
    setShowAddCity(false);
    handleSelect(city.id);
  }

  function handleRemoveCity(id: string) {
    removeCity(id);
    const updated = loadCities();
    setCities(updated);
    if (selectedId === id) handleSelect(updated[0].id);
  }

  return (
    <PanelShell
      title="Weather"
      accent="var(--accent-weather)"
      status={selectedCity ? (weather?.current ? selectedCity.name : "Offline") : undefined}
    >
      <CitySelector
        cities={cities}
        selectedId={selectedId}
        onSelect={handleSelect}
        onAddCity={() => setShowAddCity((v) => !v)}
        onRemove={handleRemoveCity}
      />

      {showAddCity && <AddCityForm onAdd={handleAddCity} onCancel={() => setShowAddCity(false)} />}

      {staleSince !== null && (
        <div className="mb-4 flex justify-center">
          <StaleBadge savedAt={staleSince} />
        </div>
      )}

      {!weather && !error && <p className="text-center text-[var(--text-secondary)]">Loading weather…</p>}

      {(!weather?.current && (error || weather)) && (
        <div
          className="control-surface mx-auto flex max-w-md flex-col items-center gap-1.5 p-8 text-center"
          style={{ "--accent": "var(--accent-weather)" } as CSSProperties}
        >
          <span className="instrument-label flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--text-tertiary)]" />
            Offline
          </span>
          <p className="font-display mt-2 text-[22px] font-normal">Weather unavailable</p>
          <p className="mt-1 text-[14px] text-[var(--text-secondary)]">
            The {selectedCity?.name ?? "selected"} forecast could not be refreshed right now.
          </p>
        </div>
      )}

      {weather?.current && weather.warnings.length > 0 && (
        <p className="mb-4 text-center text-[12px] text-[var(--text-tertiary)]">{weather.warnings[0]}</p>
      )}

      {weather?.current && (
        <div
          className="control-surface overflow-hidden"
          style={{ "--accent": "var(--accent-weather)" } as CSSProperties}
          data-active
        >
          <div className="grid sm:grid-cols-[1fr_280px]">
            <div className="p-10 sm:p-12">
              <ConditionsCard
                current={weather.current}
                cityName={selectedCity?.name ?? ""}
                today={weather.forecast[0]}
              />
            </div>
            <div className="media-tonal hidden min-h-[220px] sm:block" />
          </div>
          <div className="border-t border-[var(--border)] p-8 sm:p-10">
            <ForecastStrip forecast={weather.forecast} />
          </div>
        </div>
      )}

      {selectedCity?.radarId && (
        <div className="mt-8">
          <RadarLoop radarId={selectedCity.radarId} />
        </div>
      )}
    </PanelShell>
  );
}
