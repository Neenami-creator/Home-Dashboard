"use client";

import { useEffect } from "react";

// Keeps the screen on while a recipe is open - reading it while cooking
// means flour-covered hands aren't available to keep tapping the screen
// awake. Feature-detected since older Safari (this app's whole reason for
// existing is an iPad stuck on an old iOS) may not support it; degrades
// silently to normal screen-timeout behavior when unavailable.
export function useWakeLock(active: boolean) {
  useEffect(() => {
    if (!active || !("wakeLock" in navigator)) return;

    let lock: WakeLockSentinel | null = null;
    let cancelled = false;

    async function acquire() {
      try {
        lock = await navigator.wakeLock.request("screen");
      } catch {
        // Can fail if the document isn't visible yet, or isn't supported
        // despite feature detection (some in-app browsers lie); harmless.
      }
    }

    function handleVisibilityChange() {
      // The Wake Lock API releases itself whenever the tab is backgrounded,
      // so it needs re-acquiring when this page becomes visible again.
      if (document.visibilityState === "visible" && !cancelled) acquire();
    }

    acquire();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      lock?.release().catch(() => {});
    };
  }, [active]);
}
