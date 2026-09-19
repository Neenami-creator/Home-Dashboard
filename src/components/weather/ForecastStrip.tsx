"use client";

import { motion } from "motion/react";
import { Droplets } from "lucide-react";
import type { ForecastDay } from "@/lib/weather/types";
import { weatherIcon } from "@/lib/weather/icon";

const gridVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};
const cardVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

function dayLabel(isoLike: string, index: number): string {
  if (index === 0) return "Today";
  const date = new Date(isoLike);
  if (Number.isNaN(date.getTime())) return `Day ${index + 1}`;
  return date.toLocaleDateString(undefined, { weekday: "short" });
}

export function ForecastStrip({ forecast }: { forecast: ForecastDay[] }) {
  if (forecast.length === 0) {
    return <p className="text-center text-[var(--text-tertiary)]">No forecast available.</p>;
  }

  return (
    <motion.div
      variants={gridVariants}
      initial="hidden"
      animate="visible"
      className="mx-auto grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4"
    >
      {forecast.slice(0, 4).map((day, index) => {
        // Selects among a fixed set of Lucide icon components; doesn't define a new one.
        const Icon = weatherIcon(day.precis);
        return (
          <motion.div
            key={day.date || index}
            variants={cardVariants}
            className="flex flex-col items-center gap-1.5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 text-center"
          >
            <span className="text-sm font-medium text-[var(--text-secondary)]">
              {dayLabel(day.date, index)}
            </span>
            <Icon size={28} className="my-1 text-[var(--accent-weather)]" />
            <span className="text-xs text-[var(--text-secondary)]">{day.precis || "—"}</span>
            <span className="mt-1 text-lg">
              {day.maxTempC !== null ? Math.round(day.maxTempC) : "—"}° /{" "}
              {day.minTempC !== null ? Math.round(day.minTempC) : "—"}°
            </span>
            {day.chanceOfRainPercent !== null && (
              <span className="flex items-center gap-1 text-xs text-[var(--accent-weather)]">
                <Droplets size={12} />
                {day.chanceOfRainPercent}%
              </span>
            )}
          </motion.div>
        );
      })}
    </motion.div>
  );
}
