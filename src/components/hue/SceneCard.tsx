"use client";

import type { CSSProperties } from "react";
import { Check, Sparkles } from "lucide-react";
import type { HueScene } from "@/lib/hue/types";

const ACCENT = "var(--accent-hue)";

export function SceneCard({
  scene,
  selected,
  busy,
  onSelect,
}: {
  scene: HueScene;
  selected: boolean;
  busy: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      disabled={busy}
      onClick={onSelect}
      data-active={selected}
      style={{ "--accent": ACCENT } as CSSProperties}
      className="control-surface flex flex-col overflow-hidden text-left disabled:opacity-60"
    >
      <div className="media-tonal flex h-16 items-end justify-end p-3">
        <Sparkles size={16} strokeWidth={1.6} style={{ color: ACCENT }} />
      </div>
      <div className="flex items-center justify-between p-4">
        <span className="text-[15px] font-medium">{scene.name}</span>
        <span
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border"
          style={{
            borderColor: selected ? ACCENT : "var(--border-strong)",
            backgroundColor: selected ? ACCENT : "transparent",
          }}
        >
          {selected && <Check size={13} className="text-[var(--background)]" />}
        </span>
      </div>
    </button>
  );
}
