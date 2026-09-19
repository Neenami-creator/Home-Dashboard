import type { CurrentConditions } from "@/lib/weather/types";

export function ConditionsCard({ current }: { current: CurrentConditions }) {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
      <p className="text-sm text-white/40">
        {current.stationName} · {current.observedAt}
      </p>
      <p className="text-6xl font-semibold">
        {current.airTempC !== null ? `${Math.round(current.airTempC)}°` : "—"}
      </p>
      <p className="text-white/60">{current.conditionText ?? "Conditions unavailable"}</p>

      <div className="mt-4 flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm text-white/50">
        {current.feelsLikeC !== null && <span>Feels like {Math.round(current.feelsLikeC)}°</span>}
        {current.humidityPercent !== null && <span>Humidity {current.humidityPercent}%</span>}
        {current.windSpeedKmh !== null && (
          <span>
            Wind {current.windDirection ?? ""} {Math.round(current.windSpeedKmh)} km/h
          </span>
        )}
        {current.gustKmh !== null && <span>Gusts {Math.round(current.gustKmh)} km/h</span>}
      </div>
    </div>
  );
}
