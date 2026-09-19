"use client";

import type { WeatherCity } from "@/lib/weather/types";

export function CitySelector({
  cities,
  selectedId,
  onSelect,
  onAddCity,
  onRemove,
}: {
  cities: WeatherCity[];
  selectedId: string;
  onSelect: (id: string) => void;
  onAddCity: () => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-center gap-2">
      {cities.map((city) => (
        <div key={city.id} className="group relative">
          <button
            type="button"
            onClick={() => onSelect(city.id)}
            className={`rounded-full border px-4 py-2 text-sm transition ${
              city.id === selectedId
                ? "border-[color-mix(in_srgb,var(--accent-weather)_45%,transparent)] bg-[color-mix(in_srgb,var(--accent-weather)_12%,transparent)] text-[var(--accent-weather)]"
                : "border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]"
            }`}
          >
            {city.name}
          </button>
          {!city.builtIn && (
            <button
              type="button"
              onClick={() => onRemove(city.id)}
              aria-label={`Remove ${city.name}`}
              className="absolute -right-1 -top-1 hidden h-4 w-4 rounded-full bg-[var(--surface-hover)] text-[10px] leading-4 text-white group-hover:block"
            >
              ×
            </button>
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={onAddCity}
        className="rounded-full border border-dashed border-[var(--border-strong)] px-4 py-2 text-sm text-[var(--text-secondary)] transition hover:bg-[var(--surface-hover)]"
      >
        + Add city
      </button>
    </div>
  );
}
