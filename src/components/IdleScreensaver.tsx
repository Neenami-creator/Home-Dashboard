"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Clock } from "@/components/Clock";
import { loadCities, loadSelectedCityId } from "@/lib/weather/cities";
import { fetchCityWeather } from "@/lib/weather/client";
import { weatherIcon } from "@/lib/weather/icon";
import type { CurrentConditions } from "@/lib/weather/types";

// A wall-mounted display that never sleeps risks burn-in and wastes the
// "it's basically a clock" opportunity, so after a stretch of no touches
// it dims to a big clock (and, if a city's been picked in the Weather
// panel, current conditions) instead of sitting on whatever panel was
// last open. Any touch, click or key press wakes it instantly.
const IDLE_TIMEOUT_MS = 5 * 60 * 1000;
const WEATHER_REFRESH_MS = 10 * 60 * 1000;
const ACTIVITY_EVENTS = ["pointerdown", "touchstart", "keydown", "wheel"] as const;

export function IdleScreensaver({ children }: { children: ReactNode }) {
  const [idle, setIdle] = useState(false);
  const [conditions, setConditions] = useState<CurrentConditions | null>(null);
  const [cityName, setCityName] = useState("");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function resetTimer() {
      setIdle(false);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setIdle(true), IDLE_TIMEOUT_MS);
    }

    resetTimer();
    for (const eventName of ACTIVITY_EVENTS) {
      window.addEventListener(eventName, resetTimer);
    }
    return () => {
      for (const eventName of ACTIVITY_EVENTS) {
        window.removeEventListener(eventName, resetTimer);
      }
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!idle) return;
    let cancelled = false;

    async function loadWeather() {
      const city = loadCities().find((c) => c.id === loadSelectedCityId());
      if (!city) return;
      try {
        const result = await fetchCityWeather(city);
        if (!cancelled) {
          setConditions(result.current);
          setCityName(city.name);
        }
      } catch {
        // The screensaver degrades gracefully to just the clock.
      }
    }

    loadWeather();
    const interval = setInterval(loadWeather, WEATHER_REFRESH_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [idle]);

  // Selects among a fixed set of Lucide icon components; doesn't define a new one.
  const WeatherIcon = weatherIcon(conditions?.conditionText ?? null);

  return (
    <>
      {children}
      {idle && (
        <div className="animate-fade-in fixed inset-0 z-50 flex flex-col items-center justify-center gap-8 bg-[var(--background)]">
          <Clock className="[&_p:first-child]:text-center [&_p:first-child]:text-8xl [&_p:first-child]:font-semibold [&_p:last-child]:mt-2 [&_p:last-child]:text-center [&_p:last-child]:text-lg" />
          {conditions?.airTempC != null && (
            <div className="flex items-center gap-3 text-2xl text-[var(--text-secondary)]">
              {/* eslint-disable-next-line react-hooks/static-components -- WeatherIcon selects among fixed Lucide components, not defined during render */}
              <WeatherIcon size={32} className="text-[var(--accent-weather)]" />
              <span>
                {Math.round(conditions.airTempC)}° · {cityName}
              </span>
            </div>
          )}
          <p className="text-xs text-[var(--text-tertiary)]">Tap to wake</p>
        </div>
      )}
    </>
  );
}
