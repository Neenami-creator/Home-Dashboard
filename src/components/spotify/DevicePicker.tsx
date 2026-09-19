"use client";

import type { SpotifyDevice } from "@/lib/spotify/types";

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
      <p className="text-sm text-white/40">
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
          className={`rounded-full border px-4 py-2 text-sm transition disabled:opacity-60 ${
            device.is_active
              ? "border-[#1ed760] bg-[#1ed760]/10 text-[#1ed760]"
              : "border-white/15 text-white/70 hover:bg-white/10"
          }`}
        >
          {device.name}
        </button>
      ))}
    </div>
  );
}
