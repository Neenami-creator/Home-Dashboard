"use client";

import type { BridgeConfig } from "./types";

const STORAGE_KEY = "hue-bridge-config";

export function loadBridgeConfig(): BridgeConfig | null {
  if (typeof window === "undefined") return null;

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as BridgeConfig;
      if (parsed.ip && parsed.appKey) return parsed;
    }
  } catch {
    // ignore malformed storage
  }

  // Fall back to build-time defaults so a household with a stable bridge IP
  // never has to fill in the settings form after a fresh install.
  const envIp = process.env.NEXT_PUBLIC_HUE_BRIDGE_IP;
  const envKey = process.env.NEXT_PUBLIC_HUE_APP_KEY;
  if (envIp && envKey) return { ip: envIp, appKey: envKey };

  return null;
}

export function saveBridgeConfig(config: BridgeConfig) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

export function clearBridgeConfig() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}
