"use client";

import { useState } from "react";
import { Lightbulb, Palette, Sparkles } from "lucide-react";
import type { HueRoomState, HueScene } from "@/lib/hue/types";
import { HUE_COLOR_PRESETS } from "@/lib/hue/presets";
import { Card } from "@/components/ui/Card";
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

  return (
    <Card glow={ACCENT} active={room.on} className="p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{
              backgroundColor: room.on ? `color-mix(in srgb, ${ACCENT} 22%, transparent)` : "var(--surface-hover)",
              color: room.on ? ACCENT : "var(--text-tertiary)",
            }}
          >
            <Lightbulb size={19} fill={room.on ? "currentColor" : "none"} />
          </div>
          <span className="text-lg font-medium">{room.name}</span>
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
        <div className="mt-1 text-right text-xs text-[var(--text-tertiary)]">{localBrightness}%</div>
      </div>

      {scenes.length > 0 && (
        <div className="mt-3">
          <p className="mb-1.5 flex items-center gap-1.5 text-xs text-[var(--text-tertiary)]">
            <Sparkles size={13} />
            Scenes
          </p>
          <div className="flex flex-wrap gap-1.5">
            {scenes.map((scene) => (
              <button
                key={scene.id}
                type="button"
                disabled={busy}
                onClick={() => onScene(scene.id)}
                className="rounded-full border border-[var(--border)] px-3 py-1 text-xs text-[var(--text-secondary)] transition hover:border-[var(--border-strong)] hover:bg-[var(--surface-hover)] disabled:opacity-40"
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
        className="mt-3 flex items-center gap-1.5 text-xs text-[var(--text-tertiary)] transition hover:text-[var(--text-secondary)]"
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
    </Card>
  );
}
