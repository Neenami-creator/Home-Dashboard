"use client";

import type { CSSProperties } from "react";
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
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {devices.map((device) => (
        <button
          key={device.id ?? device.name}
          type="button"
          disabled={busy || !device.id || device.is_active}
          onClick={() => device.id && onSelect(device.id)}
          data-active={device.is_active}
          style={{ "--accent": ACCENT } as CSSProperties}
          className="control-surface flex items-center gap-3 p-4 text-left disabled:opacity-90"
        >
          <span
            className="media-tonal flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px]"
            style={{ color: device.is_active ? ACCENT : "var(--text-tertiary)" }}
          >
            <Speaker size={18} strokeWidth={1.6} />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-[15px] font-medium">{device.name}</span>
            <span className="text-[13px]" style={{ color: device.is_active ? ACCENT : "var(--text-tertiary)" }}>
              {device.is_active ? "Playing now" : "Tap to play"}
            </span>
          </span>
        </button>
      ))}
    </div>
  );
}
