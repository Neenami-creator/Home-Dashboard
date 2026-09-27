"use client";

import { useState } from "react";
import { Palette } from "lucide-react";
import type { HueRoomState } from "@/lib/hue/types";
import { HUE_COLOR_PRESETS } from "@/lib/hue/presets";

const ACCENT = "var(--accent-hue)";

export function BrightnessPanel({
  room,
  busy,
  onBrightness,
  onColor,
}: {
  room: HueRoomState | undefined;
  busy: boolean;
  onBrightness: (brightness: number) => void;
  onColor: (xy: [number, number]) => void;
}) {
  const [localBrightness, setLocalBrightness] = useState(room?.brightness ?? 0);
  const [showColors, setShowColors] = useState(false);
  const [syncedRoomId, setSyncedRoomId] = useState(room?.id);

  // Reset the slider to the room's actual brightness whenever the selected
  // room changes, without clobbering in-progress local drag state on every
  // background refresh of the same room (adjusting during render, per
  // https://react.dev/learn/you-might-not-need-an-effect, rather than an effect).
  if (room && room.id !== syncedRoomId) {
    setSyncedRoomId(room.id);
    setLocalBrightness(room.brightness);
  }

  if (!room) {
    return (
      <div className="control-surface flex min-h-[220px] items-center justify-center p-6 text-[14px] text-[var(--text-tertiary)]">
        Select a room
      </div>
    );
  }

  return (
    <div className="control-surface p-6">
      <p className="instrument-label">{room.name}</p>
      <p className="font-display mt-2 text-[56px] leading-[0.95] font-normal">{localBrightness}%</p>
      <p className="mt-1 text-[14px] text-[var(--text-secondary)]">Brightness</p>

      <input
        type="range"
        min={1}
        max={100}
        value={localBrightness}
        disabled={busy || !room.on || !room.groupedLightId}
        onChange={(e) => setLocalBrightness(Number(e.target.value))}
        onPointerUp={() => onBrightness(localBrightness)}
        className="mt-5 w-full accent-current disabled:opacity-40"
        style={{ color: ACCENT }}
      />
      <div className="mt-1.5 flex justify-between text-[12px] text-[var(--text-tertiary)]">
        <span>0%</span>
        <span>100%</span>
      </div>

      <button
        type="button"
        onClick={() => setShowColors((v) => !v)}
        className="mt-5 flex items-center gap-1.5 text-[13px] text-[var(--text-tertiary)] transition-colors hover:text-[var(--text-secondary)]"
      >
        <Palette size={14} />
        {showColors ? "Hide colors" : "Quick colors"}
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
              className="h-8 w-8 rounded-full border border-[var(--border-strong)] transition hover:scale-110 disabled:opacity-40"
              style={{ backgroundColor: preset.swatch }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
