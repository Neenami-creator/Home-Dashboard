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
          className="flex items-center gap-2 rounded-[12px] border bg-[var(--surface-2)] px-4 py-2 text-[13px] shadow-[inset_0_1px_0_var(--inset-highlight)] transition-colors hover:border-[var(--border-strong)] disabled:opacity-60"
          style={
            device.is_active
              ? { borderColor: "var(--border)", color: ACCENT }
              : { borderColor: "var(--border)", color: "var(--text-secondary)" }
          }
        >
          <Speaker size={14} strokeWidth={1.7} />
          {device.name}
          {device.is_active && <span className="h-[5px] w-[5px] rounded-full" style={{ backgroundColor: ACCENT }} />}
        </button>
      ))}
    </div>
  );
}
