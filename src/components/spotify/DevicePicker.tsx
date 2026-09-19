"use client";

import { Speaker } from "lucide-react";
import type { SpotifyDevice } from "@/lib/spotify/types";

const ACCENT = "var(--accent-spotify)";

export function DevicePicker({
  devices,
  onSelect,
  busy,
}: {
  devices: SpotifyDevice[];
  onSelect: (deviceId: string) => void;
  busy: boolean;
}) {
  if (devices.length === 0) {
    return (
      <p className="text-center text-sm text-[var(--text-tertiary)]">
        No Spotify Connect devices found. Open Spotify on a Sonos speaker (or any device) so
        it shows up here.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap justify-center gap-2">
      {devices.map((device) => (
        <button
          key={device.id ?? device.name}
          type="button"
          disabled={busy || !device.id || device.is_active}
          onClick={() => device.id && onSelect(device.id)}
          className="flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition hover:bg-[var(--surface-hover)] disabled:opacity-60"
          style={
            device.is_active
              ? {
                  borderColor: `color-mix(in srgb, ${ACCENT} 45%, transparent)`,
                  backgroundColor: `color-mix(in srgb, ${ACCENT} 12%, transparent)`,
                  color: ACCENT,
                }
              : { borderColor: "var(--border)", color: "var(--text-secondary)" }
          }
        >
          <Speaker size={14} />
          {device.name}
        </button>
      ))}
    </div>
  );
}
