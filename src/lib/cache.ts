"use client";

// A tiny last-known-good cache so a panel that fails to reach its API on a
// cold load (page refresh during a WiFi hiccup, bridge rebooting, etc.) can
// show what it last knew instead of a blank state or a bare error - a
// display that's always mounted on a wall should degrade to "stale" before
// it ever looks broken.
const PREFIX = "dashboard-cache:";

type CacheEntry<T> = {
  data: T;
  savedAt: number;
};

export function saveCache<T>(key: string, data: T): void {
  try {
    const entry: CacheEntry<T> = { data, savedAt: Date.now() };
    window.localStorage.setItem(PREFIX + key, JSON.stringify(entry));
  } catch {
    // Storage can be full or unavailable (private browsing); caching is a
    // nice-to-have, so fail silently.
  }
}

export function loadCache<T>(key: string): CacheEntry<T> | null {
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    return raw ? (JSON.parse(raw) as CacheEntry<T>) : null;
  } catch {
    return null;
  }
}

export function formatRelativeTime(timestampMs: number): string {
  const diffSeconds = Math.max(0, Math.round((Date.now() - timestampMs) / 1000));
  if (diffSeconds < 60) return "just now";
  const minutes = Math.round(diffSeconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}
