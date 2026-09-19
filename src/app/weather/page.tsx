"use client";

import { useCallback, useEffect, useState } from "react";
import { PanelShell } from "@/components/PanelShell";
import { CitySelector } from "@/components/weather/CitySelector";
import { AddCityForm } from "@/components/weather/AddCityForm";
import { ConditionsCard } from "@/components/weather/ConditionsCard";
import { ForecastStrip } from "@/components/weather/ForecastStrip";
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
    <PanelShell title="Weather" accent="var(--accent-weather)">
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

      {error && (
        <div className="mb-6 rounded-xl border border-red-400/30 bg-red-400/10 p-4 text-center text-sm text-red-300">
          {error}
        </div>
      )}

      {weather?.warnings.map((warning) => (
        <p key={warning} className="mb-2 text-center text-xs text-amber-300/70">
          {warning}
        </p>
      ))}

      {!weather && !error && <p className="text-center text-[var(--text-secondary)]">Loading weather…</p>}

      {weather?.current && (
        <div className="mb-8">
          <ConditionsCard current={weather.current} />
        </div>
      )}

      {weather && <ForecastStrip forecast={weather.forecast} />}
    </PanelShell>
  );
}
