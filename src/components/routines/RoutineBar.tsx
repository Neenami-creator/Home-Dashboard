"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { Check, Settings } from "lucide-react";
import { loadRoutines } from "@/lib/routines/storage";
import { runRoutine } from "@/lib/routines/run";
import { ROUTINE_ICONS } from "@/lib/routines/icons";
import type { Routine } from "@/lib/routines/types";

export function RoutineBar() {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [runningId, setRunningId] = useState<string | null>(null);
  const [justRanId, setJustRanId] = useState<string | null>(null);

  useEffect(() => {
    // Reads localStorage, which isn't available during server rendering.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRoutines(loadRoutines());
  }, []);

  async function handleRun(routine: Routine) {
    setRunningId(routine.id);
    try {
      await runRoutine(routine);
      setJustRanId(routine.id);
      setTimeout(() => setJustRanId(null), 1500);
    } finally {
      setRunningId(null);
    }
  }

  if (routines.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      {routines.map((routine) => {
        const Icon = ROUTINE_ICONS[routine.icon];
        const isRunning = runningId === routine.id;
        const justRan = justRanId === routine.id;
        return (
          <motion.button
            key={routine.id}
            type="button"
            whileTap={{ scale: 0.985 }}
            transition={{ type: "spring", stiffness: 440, damping: 38, mass: 0.65 }}
            disabled={isRunning}
            onClick={() => handleRun(routine)}
            className="flex h-12 items-center gap-2 rounded-[14px] border border-[var(--border)] bg-[var(--surface-2)] px-[18px] text-[15px] shadow-[inset_0_1px_0_var(--inset-highlight)] transition-colors hover:border-[var(--border-strong)] disabled:opacity-60"
          >
            {justRan ? (
              <Check size={16} className="text-[var(--accent-hue)]" />
            ) : (
              <Icon size={16} className="text-[var(--text-secondary)]" />
            )}
            <span>{routine.name}</span>
          </motion.button>
        );
      })}
      <Link
        href="/settings#routines"
        aria-label="Edit routines"
        className="flex h-12 w-12 items-center justify-center rounded-[14px] border border-[var(--border)] bg-[var(--surface-2)] text-[var(--text-tertiary)] shadow-[inset_0_1px_0_var(--inset-highlight)] transition-colors hover:border-[var(--border-strong)]"
      >
        <Settings size={15} />
      </Link>
    </div>
  );
}
