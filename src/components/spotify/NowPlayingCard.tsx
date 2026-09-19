"use client";

import Image from "next/image";
import { useState } from "react";
import type { SpotifyPlaybackState } from "@/lib/spotify/types";

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
    <div className="mx-auto flex max-w-xl flex-col items-center gap-6 rounded-2xl border border-white/10 bg-white/5 p-8">
      {artwork ? (
        <Image
          src={artwork}
          alt={track?.album.name ?? "Album art"}
          width={220}
          height={220}
          className="rounded-xl shadow-lg"
          unoptimized
        />
      ) : (
        <div className="flex h-[220px] w-[220px] items-center justify-center rounded-xl bg-white/10 text-white/30">
          No artwork
        </div>
      )}

      <div className="text-center">
        <p className="text-xl font-semibold">{track?.name ?? "Nothing playing"}</p>
        <p className="mt-1 text-white/60">
          {track?.artists.map((a) => a.name).join(", ") ?? "—"}
        </p>
        {state.device && (
          <p className="mt-2 text-xs text-white/40">Playing on {state.device.name}</p>
        )}
      </div>

      {track && (
        <div className="w-full text-xs text-white/40">
          <div className="flex justify-between">
            <span>{formatMs(state.progress_ms ?? 0)}</span>
            <span>{formatMs(track.duration_ms)}</span>
          </div>
          <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full bg-[#1ed760]"
              style={{
                width: `${Math.min(100, ((state.progress_ms ?? 0) / track.duration_ms) * 100)}%`,
              }}
            />
          </div>
        </div>
      )}

      <div className="flex items-center gap-6">
        <button
          type="button"
          onClick={onPrevious}
          disabled={busy}
          className="text-3xl text-white/80 transition hover:text-white disabled:opacity-40"
          aria-label="Previous track"
        >
          ⏮
        </button>
        <button
          type="button"
          onClick={onPlayPause}
          disabled={busy}
          className="flex h-16 w-16 items-center justify-center rounded-full bg-[#1ed760] text-2xl text-black transition disabled:opacity-40"
          aria-label={state.is_playing ? "Pause" : "Play"}
        >
          {state.is_playing ? "⏸" : "▶"}
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={busy}
          className="text-3xl text-white/80 transition hover:text-white disabled:opacity-40"
          aria-label="Next track"
        >
          ⏭
        </button>
      </div>

      <div className="flex w-full items-center gap-3">
        <span className="text-white/40">🔉</span>
        <input
          type="range"
          min={0}
          max={100}
          value={localVolume}
          disabled={busy}
          onChange={(e) => setLocalVolume(Number(e.target.value))}
          onPointerUp={() => onVolume(localVolume)}
          className="w-full accent-[#1ed760] disabled:opacity-40"
        />
        <span className="w-8 text-right text-xs text-white/40">{localVolume}%</span>
      </div>
    </div>
  );
}
