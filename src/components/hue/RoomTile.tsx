"use client";

import type { CSSProperties } from "react";
import { Lightbulb } from "lucide-react";
import type { HueRoomState } from "@/lib/hue/types";
import { Toggle } from "@/components/ui/Toggle";

const ACCENT = "var(--accent-hue)";

export function RoomTile({
  room,
  selected,
  onSelect,
  onToggle,
  busy,
}: {
  room: HueRoomState;
  selected: boolean;
  onSelect: () => void;
  onToggle: (on: boolean) => void;
  busy: boolean;
}) {
  return (
    <div
      className="control-surface flex min-h-[150px] flex-col overflow-hidden"
      data-active={selected}
      style={{ "--accent": ACCENT } as CSSProperties}
    >
      <button type="button" onClick={onSelect} className="media-tonal flex h-20 items-end p-4 text-left">
        <Lightbulb
          size={20}
          strokeWidth={1.6}
          fill={room.on ? "currentColor" : "none"}
          style={{ color: room.on ? ACCENT : "var(--text-tertiary)" }}
        />
      </button>
      <div className="flex flex-1 flex-col justify-between p-4">
        <div className="flex items-center justify-between">
          <button type="button" onClick={onSelect} className="text-left text-[16px] font-medium">
            {room.name}
          </button>
          <Toggle
            on={room.on}
            onChange={onToggle}
            accent={ACCENT}
            disabled={busy || !room.groupedLightId}
            ariaLabel={room.on ? `Turn off ${room.name}` : `Turn on ${room.name}`}
          />
        </div>
        <p className="mt-2 text-[13px] text-[var(--text-tertiary)]">
          {room.on ? `${room.brightness}% brightness` : "Off"}
        </p>
      </div>
    </div>
  );
}
