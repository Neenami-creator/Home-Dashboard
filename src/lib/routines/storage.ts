"use client";

import type { Routine } from "./types";

const STORAGE_KEY = "dashboard-routines";

// Three starting points matching the household moments most worth a
// one-tap shortcut for. Scene assignments start empty since we can't know
// a household's actual Hue scene names in advance - the Settings screen is
// where each gets wired up to real scenes per room.
const DEFAULT_ROUTINES: Routine[] = [
  { id: "dinner", name: "Eating dinner", icon: "dinner", sceneByRoom: {}, pauseSpotify: false },
  { id: "cooking", name: "Cooking", icon: "cooking", sceneByRoom: {}, pauseSpotify: false },
  { id: "movie", name: "Watching a movie", icon: "movie", sceneByRoom: {}, pauseSpotify: false },
];

export function loadRoutines(): Routine[] {
  if (typeof window === "undefined") return DEFAULT_ROUTINES;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return DEFAULT_ROUTINES;
    const parsed = JSON.parse(stored) as Routine[];
    return parsed.length > 0 ? parsed : DEFAULT_ROUTINES;
  } catch {
    return DEFAULT_ROUTINES;
  }
}

export function saveRoutines(routines: Routine[]): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(routines));
}

export function addRoutine(routine: Routine): void {
  saveRoutines([...loadRoutines(), routine]);
}

export function updateRoutine(id: string, patch: Partial<Routine>): void {
  saveRoutines(loadRoutines().map((r) => (r.id === id ? { ...r, ...patch } : r)));
}

export function removeRoutine(id: string): void {
  saveRoutines(loadRoutines().filter((r) => r.id !== id));
}
