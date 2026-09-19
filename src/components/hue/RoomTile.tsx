"use client";

import { useState } from "react";
import type { HueRoomState } from "@/lib/hue/types";
import { HUE_COLOR_PRESETS } from "@/lib/hue/presets";

export function RoomTile({
  room,
  onToggle,
  onBrightness,
  onColor,
  busy,
}: {
  room: HueRoomState;
  onToggle: (on: boolean) => void;
  onBrightness: (brightness: number) => void;
  onColor: (xy: [number, number]) => void;
  busy: boolean;
}) {
  const [localBrightness, setLocalBrightness] = useState(room.brightness);
  const [showColors, setShowColors] = useState(false);

  return (
    <div
      className={`rounded-2xl border p-5 transition ${
        room.on ? "border-amber-300/40 bg-amber-300/10" : "border-white/10 bg-white/5"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-lg font-medium">{room.name}</span>
        <button
          type="button"
          disabled={busy || !room.groupedLightId}
          onClick={() => onToggle(!room.on)}
          className={`h-9 w-16 rounded-full border transition disabled:opacity-40 ${
            room.on ? "border-amber-300 bg-amber-300" : "border-white/20 bg-white/10"
          }`}
          aria-label={room.on ? "Turn off" : "Turn on"}
        >
          <span
            className={`block h-7 w-7 translate-x-1 rounded-full bg-black/70 transition ${
              room.on ? "translate-x-8 bg-black" : ""
            }`}
          />
        </button>
      </div>

      <div className="mt-4">
        <input
          type="range"
          min={1}
          max={100}
          value={localBrightness}
          disabled={busy || !room.on || !room.groupedLightId}
          onChange={(e) => setLocalBrightness(Number(e.target.value))}
          onPointerUp={() => onBrightness(localBrightness)}
          className="w-full accent-amber-300 disabled:opacity-40"
        />
        <div className="mt-1 text-right text-xs text-white/50">{localBrightness}%</div>
      </div>

      <button
        type="button"
        onClick={() => setShowColors((v) => !v)}
        className="mt-2 text-xs text-white/50 underline underline-offset-2"
      >
        {showColors ? "Hide colors" : "Colors"}
      </button>

      {showColors && (
        <div className="mt-3 flex flex-wrap gap-2">
          {HUE_COLOR_PRESETS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              title={preset.name}
              disabled={busy || !room.groupedLightId}
              onClick={() => onColor(preset.xy)}
              className="h-8 w-8 rounded-full border border-white/20 disabled:opacity-40"
              style={{ backgroundColor: preset.swatch }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
