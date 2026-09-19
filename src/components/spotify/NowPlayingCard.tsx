"use client";

import Image from "next/image";
import { useState } from "react";
import { Pause, Play, SkipBack, SkipForward, Volume1, Volume2 } from "lucide-react";
import type { SpotifyPlaybackState } from "@/lib/spotify/types";
import { IconButton } from "@/components/ui/IconButton";

const ACCENT = "var(--accent-spotify)";

function formatMs(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function NowPlayingCard({
  state,
  onPlayPause,
  onNext,
  onPrevious,
  onVolume,
  busy,
}: {
  state: SpotifyPlaybackState;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onVolume: (percent: number) => void;
  busy: boolean;
}) {
  const track = state.item;
  const artwork = track?.album.images[0]?.url;
  const [localVolume, setLocalVolume] = useState(state.device?.volume_percent ?? 50);

  return (
    <div className="relative mx-auto flex max-w-xl flex-col items-center gap-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8">
      {artwork && (
        <div
          className="pointer-events-none absolute left-1/2 top-8 h-[220px] w-[220px] -translate-x-1/2 rounded-xl opacity-40 blur-3xl"
          style={{ backgroundColor: ACCENT }}
        />
      )}

      {artwork ? (
        <Image
          src={artwork}
          alt={track?.album.name ?? "Album art"}
          width={220}
          height={220}
          className="relative rounded-xl shadow-2xl"
          unoptimized
        />
      ) : (
        <div className="relative flex h-[220px] w-[220px] items-center justify-center rounded-xl bg-[var(--surface-hover)] text-[var(--text-tertiary)]">
          No artwork
        </div>
      )}

      <div className="relative text-center">
        <p className="text-xl font-semibold">{track?.name ?? "Nothing playing"}</p>
        <p className="mt-1 text-[var(--text-secondary)]">
          {track?.artists.map((a) => a.name).join(", ") ?? "—"}
        </p>
        {state.device && (
          <p className="mt-2 text-xs text-[var(--text-tertiary)]">Playing on {state.device.name}</p>
        )}
      </div>

      {track && (
        <div className="relative w-full text-xs text-[var(--text-tertiary)]">
          <div className="flex justify-between">
            <span>{formatMs(state.progress_ms ?? 0)}</span>
            <span>{formatMs(track.duration_ms)}</span>
          </div>
          <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-[var(--surface-hover)]">
            <div
              className="h-full"
              style={{
                width: `${Math.min(100, ((state.progress_ms ?? 0) / track.duration_ms) * 100)}%`,
                backgroundColor: ACCENT,
              }}
            />
          </div>
        </div>
      )}

      <div className="relative flex items-center gap-6">
        <IconButton onClick={onPrevious} disabled={busy} size="lg" aria-label="Previous track">
          <SkipBack size={22} fill="currentColor" />
        </IconButton>
        <IconButton
          onClick={onPlayPause}
          disabled={busy}
          size="lg"
          variant="solid"
          accent={ACCENT}
          aria-label={state.is_playing ? "Pause" : "Play"}
        >
          {state.is_playing ? (
            <Pause size={26} fill="currentColor" />
          ) : (
            <Play size={26} fill="currentColor" className="ml-0.5" />
          )}
        </IconButton>
        <IconButton onClick={onNext} disabled={busy} size="lg" aria-label="Next track">
          <SkipForward size={22} fill="currentColor" />
        </IconButton>
      </div>

      <div className="relative flex w-full items-center gap-3">
        <Volume1 size={16} className="text-[var(--text-tertiary)]" />
        <input
          type="range"
          min={0}
          max={100}
          value={localVolume}
          disabled={busy}
          onChange={(e) => setLocalVolume(Number(e.target.value))}
          onPointerUp={() => onVolume(localVolume)}
          className="w-full accent-current disabled:opacity-40"
          style={{ color: ACCENT }}
        />
        <Volume2 size={16} className="text-[var(--text-tertiary)]" />
        <span className="w-9 text-right text-xs text-[var(--text-tertiary)]">{localVolume}%</span>
      </div>
    </div>
  );
}
