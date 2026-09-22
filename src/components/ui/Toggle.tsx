"use client";

import { motion } from "motion/react";
import { mixColors, mixWithTransparent } from "@/lib/colorMix";

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
      whileTap={disabled ? undefined : { scale: 0.96 }}
      animate={{
        borderColor: on ? mixColors(accent, 45, "var(--border-strong)") : "var(--border)",
        backgroundColor: on ? "var(--surface-2)" : "var(--surface)",
      }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      className="relative h-9 w-16 shrink-0 rounded-full border shadow-[inset_0_1px_0_var(--inset-highlight)] disabled:opacity-40"
    >
      <motion.span
        className="absolute top-1 h-6 w-6 rounded-full"
        animate={{
          x: on ? 30 : 4,
          backgroundColor: on ? accent : "var(--text-tertiary)",
          boxShadow: on ? `0 0 10px -1px ${mixWithTransparent(accent, 70)}` : "none",
        }}
        transition={{ type: "spring", stiffness: 440, damping: 38, mass: 0.65 }}
      />
    </motion.button>
  );
}
