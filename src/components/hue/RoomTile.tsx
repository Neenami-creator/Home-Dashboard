"use client";

import { useState, type CSSProperties } from "react";
import { Lightbulb, Palette, Sparkles } from "lucide-react";
import type { HueRoomState, HueScene } from "@/lib/hue/types";
import { HUE_COLOR_PRESETS } from "@/lib/hue/presets";
import { Toggle } from "@/components/ui/Toggle";

const ACCENT = "var(--accent-hue)";

export function RoomTile({
  room,
  scenes,
  onToggle,
  onBrightness,
  onColor,
  onScene,
  busy,
}: {
  room: HueRoomState;
  scenes: HueScene[];
  onToggle: (on: boolean) => void;
  onBrightness: (brightness: number) => void;
  onColor: (xy: [number, number]) => void;
  onScene: (sceneId: string) => void;
  busy: boolean;
}) {
  const [localBrightness, setLocalBrightness] = useState(room.brightness);
  const [showColors, setShowColors] = useState(false);

  // The lit state reads as a local light source, not a coloured card fill:
  // the accent bloom's opacity tracks brightness so a dim room glows faintly
  // and a room at full brightness glows more, rather than one fixed wash.
  const bloomOpacity = room.on ? 0.06 + (Math.max(1, room.brightness) / 100) * 0.1 : 0;

  return (
    <div
      className="control-surface min-h-[150px] p-5"
      data-active={room.on}
      style={{ "--accent": ACCENT, "--bloom-opacity": bloomOpacity } as CSSProperties}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-[14px] border border-[var(--border)] bg-[var(--surface-2)] shadow-[inset_0_1px_0_var(--inset-highlight)]"
            style={{ color: room.on ? ACCENT : "var(--text-tertiary)" }}
          >
            <Lightbulb size={19} strokeWidth={1.6} fill={room.on ? "currentColor" : "none"} />
          </div>
          <span className="text-[17px] font-medium">{room.name}</span>
        </div>
        <Toggle
          on={room.on}
          onChange={onToggle}
          accent={ACCENT}
          disabled={busy || !room.groupedLightId}
          ariaLabel={room.on ? `Turn off ${room.name}` : `Turn on ${room.name}`}
        />
      </div>

      <div className="mt-5">
        <input
          type="range"
          min={1}
          max={100}
          value={localBrightness}
          disabled={busy || !room.on || !room.groupedLightId}
          onChange={(e) => setLocalBrightness(Number(e.target.value))}
          onPointerUp={() => onBrightness(localBrightness)}
          className="w-full accent-current disabled:opacity-40"
          style={{ color: ACCENT }}
        />
        <div className="mt-1 text-right text-[12px] text-[var(--text-tertiary)]">{localBrightness}%</div>
      </div>

      {scenes.length > 0 && (
        <div className="mt-3">
          <p className="instrument-label mb-1.5 flex items-center gap-1.5">
            <Sparkles size={12} />
            Scenes
          </p>
          <div className="flex flex-wrap gap-1.5">
            {scenes.map((scene) => (
              <button
                key={scene.id}
                type="button"
                disabled={busy}
                onClick={() => onScene(scene.id)}
                className="rounded-[12px] border border-[var(--border)] bg-[var(--surface-2)] px-3 py-1.5 text-[13px] text-[var(--text-secondary)] transition-colors hover:border-[var(--border-strong)] disabled:opacity-40"
              >
                {scene.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setShowColors((v) => !v)}
        className="mt-3 flex items-center gap-1.5 text-[12px] text-[var(--text-tertiary)] transition-colors hover:text-[var(--text-secondary)]"
      >
        <Palette size={13} />
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
