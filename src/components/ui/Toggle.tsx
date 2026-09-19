"use client";

import { motion } from "motion/react";

export function Toggle({
  on,
  onChange,
  accent,
  disabled,
  ariaLabel,
}: {
  on: boolean;
  onChange: (on: boolean) => void;
  accent: string;
  disabled?: boolean;
  ariaLabel: string;
}) {
  return (
    <motion.button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => onChange(!on)}
      whileTap={disabled ? undefined : { scale: 0.94 }}
      animate={{
        borderColor: on ? accent : "var(--border-strong)",
        backgroundColor: on ? `color-mix(in srgb, ${accent} 85%, transparent)` : "var(--surface)",
      }}
      transition={{ duration: 0.2 }}
      className="relative h-9 w-16 shrink-0 rounded-full border disabled:opacity-40"
    >
      <motion.span
        className="absolute top-1 h-6 w-6 rounded-full bg-[#08090b] shadow"
        animate={{ x: on ? 30 : 4 }}
        transition={{ type: "spring", stiffness: 500, damping: 32 }}
      />
    </motion.button>
  );
}
