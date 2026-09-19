import { Droplets, Gauge, Wind } from "lucide-react";
import type { CurrentConditions } from "@/lib/weather/types";
import { weatherIcon } from "@/lib/weather/icon";

export function ConditionsCard({ current }: { current: CurrentConditions }) {
  // Selects among a fixed set of Lucide icon components; doesn't define a new one.
  const Icon = weatherIcon(current.conditionText);

  return (
    <div className="relative mx-auto flex max-w-xl flex-col items-center gap-2 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 text-center">
      <div
        className="pointer-events-none absolute -top-16 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full opacity-25 blur-3xl"
        style={{ backgroundColor: "var(--accent-weather)" }}
      />

      <p className="relative text-sm text-[var(--text-tertiary)]">
        {current.stationName} · {current.observedAt}
      </p>
      {/* eslint-disable-next-line react-hooks/static-components -- Icon selects among fixed Lucide components, not defined during render */}
      <Icon size={48} className="relative my-1 text-[var(--accent-weather)]" />
      <p className="font-display relative text-6xl font-semibold">
        {current.airTempC !== null ? `${Math.round(current.airTempC)}°` : "—"}
      </p>
      <p className="relative text-[var(--text-secondary)]">
        {current.conditionText ?? "Conditions unavailable"}
      </p>

      <div className="relative mt-4 flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm text-[var(--text-secondary)]">
        {current.feelsLikeC !== null && (
          <span className="flex items-center gap-1.5">
            <Gauge size={14} className="text-[var(--text-tertiary)]" />
            Feels like {Math.round(current.feelsLikeC)}°
          </span>
        )}
        {current.humidityPercent !== null && (
          <span className="flex items-center gap-1.5">
            <Droplets size={14} className="text-[var(--text-tertiary)]" />
            {current.humidityPercent}%
          </span>
        )}
        {current.windSpeedKmh !== null && (
          <span className="flex items-center gap-1.5">
            <Wind size={14} className="text-[var(--text-tertiary)]" />
            {current.windDirection ?? ""} {Math.round(current.windSpeedKmh)} km/h
          </span>
        )}
        {current.gustKmh !== null && <span>Gusts {Math.round(current.gustKmh)} km/h</span>}
      </div>
    </div>
  );
}
