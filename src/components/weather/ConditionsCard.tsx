import { Droplets, Gauge, Wind } from "lucide-react";
import type { CurrentConditions, ForecastDay } from "@/lib/weather/types";
import { weatherIcon } from "@/lib/weather/icon";

export function ConditionsCard({
  current,
  cityName,
  today,
}: {
  current: CurrentConditions;
  cityName: string;
  /** Today's forecast entry, for the H/L line - current conditions alone has no daily range. */
  today?: ForecastDay;
}) {
  // Selects among a fixed set of Lucide icon components; doesn't define a new one.
  const Icon = weatherIcon(current.conditionText);

  return (
    <div className="relative flex flex-col items-center gap-2 text-center">
      <p className="instrument-label">{cityName}</p>
      <p className="font-display mt-2 text-[88px] leading-[0.95] font-normal tracking-[-0.03em]">
        {current.airTempC !== null ? `${Math.round(current.airTempC)}°` : "—"}
      </p>

      <div className="mt-1 flex items-center justify-center gap-2.5">
        {/* eslint-disable-next-line react-hooks/static-components -- Icon selects among fixed Lucide components, not defined during render */}
        <Icon size={30} strokeWidth={1.5} className="text-[var(--accent-weather)]" />
        <span className="text-[17px] text-[var(--text-secondary)]">
          {current.conditionText ?? "Conditions unavailable"}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-[14px] text-[var(--text-secondary)]">
        {current.feelsLikeC !== null && <span>Feels like {Math.round(current.feelsLikeC)}°</span>}
        {today && (today.maxTempC !== null || today.minTempC !== null) && (
          <span>
            H {today.maxTempC !== null ? Math.round(today.maxTempC) : "—"}° · L{" "}
            {today.minTempC !== null ? Math.round(today.minTempC) : "—"}°
          </span>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-1.5 text-[13px] text-[var(--text-tertiary)]">
        {current.humidityPercent !== null && (
          <span className="flex items-center gap-1.5">
            <Droplets size={13} strokeWidth={1.7} />
            {current.humidityPercent}%
          </span>
        )}
        {current.windSpeedKmh !== null && (
          <span className="flex items-center gap-1.5">
            <Wind size={13} strokeWidth={1.7} />
            {current.windDirection ?? ""} {Math.round(current.windSpeedKmh)} km/h
          </span>
        )}
        {current.gustKmh !== null && (
          <span className="flex items-center gap-1.5">
            <Gauge size={13} strokeWidth={1.7} />
            Gusts {Math.round(current.gustKmh)} km/h
          </span>
        )}
      </div>

      <p className="mt-4 text-[12px] text-[var(--text-tertiary)]">
        {current.stationName} · {current.observedAt}
      </p>
    </div>
  );
}
