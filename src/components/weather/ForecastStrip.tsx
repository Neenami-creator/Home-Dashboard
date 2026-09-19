import type { ForecastDay } from "@/lib/weather/types";

function dayLabel(isoLike: string, index: number): string {
  if (index === 0) return "Today";
  const date = new Date(isoLike);
  if (Number.isNaN(date.getTime())) return `Day ${index + 1}`;
  return date.toLocaleDateString(undefined, { weekday: "short" });
}

export function ForecastStrip({ forecast }: { forecast: ForecastDay[] }) {
  if (forecast.length === 0) {
    return <p className="text-center text-white/40">No forecast available.</p>;
  }

  return (
    <div className="mx-auto grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
      {forecast.slice(0, 4).map((day, index) => (
        <div
          key={day.date || index}
          className="flex flex-col items-center gap-1 rounded-2xl border border-white/10 bg-white/5 p-4 text-center"
        >
          <span className="text-sm font-medium text-white/70">{dayLabel(day.date, index)}</span>
          <span className="text-xs text-white/50">{day.precis || "—"}</span>
          <span className="mt-1 text-lg">
            {day.maxTempC !== null ? Math.round(day.maxTempC) : "—"}° /{" "}
            {day.minTempC !== null ? Math.round(day.minTempC) : "—"}°
          </span>
          {day.chanceOfRainPercent !== null && (
            <span className="text-xs text-blue-300">💧 {day.chanceOfRainPercent}%</span>
          )}
        </div>
      ))}
    </div>
  );
}
