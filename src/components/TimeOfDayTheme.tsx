"use client";

import { useEffect } from "react";
import { ambientThemeForHour } from "@/lib/theme/timeOfDay";

const RECHECK_INTERVAL_MS = 5 * 60 * 1000;

/**
 * Nudges the background's ambient glow to match the time of day - warmer
 * around dawn/dusk, cooler and dimmer overnight - so a display that's on
 * every hour of every day doesn't look identical at 7am and midnight.
 * Renders nothing; just writes CSS custom properties consumed by the
 * gradients in globals.css.
 */
export function TimeOfDayTheme() {
  useEffect(() => {
    function apply() {
      const theme = ambientThemeForHour(new Date().getHours());
      const root = document.documentElement.style;
      root.setProperty("--ambient-glow-1", theme.glow1);
      root.setProperty("--ambient-glow-2", theme.glow2);
      root.setProperty("--ambient-glow-3", theme.glow3);
    }

    apply();
    const interval = setInterval(apply, RECHECK_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  return null;
}
