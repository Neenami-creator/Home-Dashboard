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
      className="mx-auto grid max-w-3xl grid-cols-2 divide-y divide-[var(--border)] sm:grid-cols-4 sm:divide-x sm:divide-y-0"
    >
      {forecast.slice(0, 4).map((day, index) => {
        // Selects among a fixed set of Lucide icon components; doesn't define a new one.
        const Icon = weatherIcon(day.precis);
        return (
          <motion.div
            key={day.date || index}
            variants={cardVariants}
            className="flex flex-col items-center gap-1.5 px-3 py-4 text-center"
          >
            <span className="instrument-label">{dayLabel(day.date, index)}</span>
            <Icon size={24} strokeWidth={1.6} className="my-1 text-[var(--accent-weather)]" />
            <span className="text-[13px] text-[var(--text-secondary)]">{day.precis || "—"}</span>
            <span className="font-display mt-1 text-[19px]">
              {day.maxTempC !== null ? Math.round(day.maxTempC) : "—"}° / {day.minTempC !== null ? Math.round(day.minTempC) : "—"}°
            </span>
            {day.chanceOfRainPercent !== null && (
              <span className="flex items-center gap-1 text-[12px] text-[var(--text-tertiary)]">
                <Droplets size={12} strokeWidth={1.7} />
                {day.chanceOfRainPercent}%
              </span>
            )}
          </motion.div>
        );
      })}
    </motion.div>
  );
}
