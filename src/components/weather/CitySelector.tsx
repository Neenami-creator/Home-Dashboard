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
            className="flex items-center gap-1.5 rounded-[12px] border border-[var(--border)] bg-[var(--surface-2)] px-4 py-2 text-[13px] shadow-[inset_0_1px_0_var(--inset-highlight)] transition-colors hover:border-[var(--border-strong)]"
            style={{ color: city.id === selectedId ? "var(--accent-weather)" : "var(--text-secondary)" }}
          >
            {city.name}
            {city.id === selectedId && (
              <span className="h-[5px] w-[5px] rounded-full" style={{ backgroundColor: "var(--accent-weather)" }} />
            )}
          </button>
          {!city.builtIn && (
            <button
              type="button"
              onClick={() => onRemove(city.id)}
              aria-label={`Remove ${city.name}`}
              className="absolute -right-1.5 -top-1.5 hidden h-4 w-4 rounded-full bg-[var(--surface-hover)] text-[10px] leading-4 text-white group-hover:block"
            >
              ×
            </button>
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={onAddCity}
        className="rounded-[12px] border border-dashed border-[var(--border-strong)] px-4 py-2 text-[13px] text-[var(--text-secondary)] transition-colors hover:border-[var(--text-tertiary)]"
      >
        + Add city
      </button>
    </div>
  );
}
