"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Clock } from "@/components/Clock";
import { loadCities, loadSelectedCityId } from "@/lib/weather/cities";
import { fetchCityWeather } from "@/lib/weather/client";
import { weatherIcon } from "@/lib/weather/icon";
import { listScreensaverPhotos } from "@/lib/screensaver/queries";
import type { CurrentConditions } from "@/lib/weather/types";

// A wall-mounted display that never sleeps risks burn-in and wastes the
// "it's basically a clock" opportunity, so after a stretch of no touches
// it dims to a big clock (and, if a city's been picked in the Weather
// panel, current conditions) instead of sitting on whatever panel was
// last open. Any touch, click or key press wakes it instantly. If any
// photos have been uploaded (Settings > Screensaver photos), it becomes a
// slow-rotating digital photo frame with the clock overlaid, rather than
// just a bare clock.
const IDLE_TIMEOUT_MS = 5 * 60 * 1000;
const WEATHER_REFRESH_MS = 10 * 60 * 1000;
const PHOTO_INTERVAL_MS = 15_000;
const ACTIVITY_EVENTS = ["pointerdown", "touchstart", "keydown", "wheel"] as const;

export function IdleScreensaver({ children }: { children: ReactNode }) {
  const [idle, setIdle] = useState(false);
  const [conditions, setConditions] = useState<CurrentConditions | null>(null);
  const [cityName, setCityName] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [photoIndex, setPhotoIndex] = useState(0);
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

    async function loadPhotos() {
      try {
        const list = await listScreensaverPhotos();
        if (!cancelled) setPhotos(list.map((p) => p.url));
      } catch {
        // No Supabase configured, or no photos - falls back to a bare clock.
      }
    }

    loadWeather();
    loadPhotos();
    const weatherInterval = setInterval(loadWeather, WEATHER_REFRESH_MS);
    return () => {
      cancelled = true;
      clearInterval(weatherInterval);
    };
  }, [idle]);

  useEffect(() => {
    if (!idle || photos.length < 2) return;
    const interval = setInterval(() => setPhotoIndex((i) => (i + 1) % photos.length), PHOTO_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [idle, photos.length]);

  // Selects among a fixed set of Lucide icon components; doesn't define a new one.
  const WeatherIcon = weatherIcon(conditions?.conditionText ?? null);
  const hasPhotos = photos.length > 0;

  return (
    <>
      {children}
      {idle && (
        <div className="animate-fade-in fixed inset-0 z-50 overflow-hidden bg-[var(--background)]">
          {hasPhotos && (
            <AnimatePresence>
              <motion.img
                key={photos[photoIndex]}
                src={photos[photoIndex]}
                alt=""
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.5 }}
                className="absolute inset-0 h-full w-full object-cover"
              />
            </AnimatePresence>
          )}
          {hasPhotos && <div className="absolute inset-0 bg-black/40" />}

          <div className="relative flex h-full flex-col items-center justify-center gap-8">
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
        </div>
      )}
    </>
  );
}
