"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Pause, Play, SkipBack, SkipForward, Volume1, Volume2 } from "lucide-react";
import type { SpotifyPlaybackState } from "@/lib/spotify/types";
import { IconButton } from "@/components/ui/IconButton";
import { extractDominantColor } from "@/lib/color";

const FALLBACK_ACCENT = "var(--accent-spotify)";

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
  const [tint, setTint] = useState<string | null>(null);

  useEffect(() => {
    if (!artwork) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTint(null);
      return;
    }
    let cancelled = false;
    extractDominantColor(artwork).then((color) => {
      if (!cancelled) setTint(color);
    });
    return () => {
      cancelled = true;
    };
  }, [artwork]);

  const accent = tint ?? FALLBACK_ACCENT;

  return (
    <motion.div
      layout
      className="relative mx-auto flex max-w-xl flex-col items-center gap-6 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8"
    >
      <motion.div
        className="pointer-events-none absolute left-1/2 top-8 h-[220px] w-[220px] -translate-x-1/2 rounded-xl blur-3xl"
        animate={{ backgroundColor: accent, opacity: artwork ? 0.4 : 0 }}
        transition={{ duration: 0.6 }}
      />

      <AnimatePresence mode="wait">
        {artwork ? (
          <motion.div
            key={artwork}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="relative"
          >
            <Image
              src={artwork}
              alt={track?.album.name ?? "Album art"}
              width={220}
              height={220}
              className="rounded-xl shadow-2xl"
              unoptimized
            />
          </motion.div>
        ) : (
          <div className="relative flex h-[220px] w-[220px] items-center justify-center rounded-xl bg-[var(--surface-hover)] text-[var(--text-tertiary)]">
            No artwork
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        <motion.div
          key={track?.name ?? "nothing"}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.25 }}
          className="relative text-center"
        >
          <p className="font-display text-xl font-semibold">{track?.name ?? "Nothing playing"}</p>
          <p className="mt-1 text-[var(--text-secondary)]">
            {track?.artists.map((a) => a.name).join(", ") ?? "—"}
          </p>
          {state.device && (
            <p className="mt-2 text-xs text-[var(--text-tertiary)]">Playing on {state.device.name}</p>
          )}
        </motion.div>
      </AnimatePresence>

      {track && (
        <div className="relative w-full text-xs text-[var(--text-tertiary)]">
          <div className="flex justify-between">
            <span>{formatMs(state.progress_ms ?? 0)}</span>
            <span>{formatMs(track.duration_ms)}</span>
          </div>
          <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-[var(--surface-hover)]">
            <motion.div
              className="h-full"
              animate={{
                width: `${Math.min(100, ((state.progress_ms ?? 0) / track.duration_ms) * 100)}%`,
                backgroundColor: accent,
              }}
              transition={{ width: { duration: 0.3, ease: "linear" }, backgroundColor: { duration: 0.6 } }}
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
          accent={accent}
          aria-label={state.is_playing ? "Pause" : "Play"}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={state.is_playing ? "pause" : "play"}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.15 }}
              className="flex items-center justify-center"
            >
              {state.is_playing ? (
                <Pause size={26} fill="currentColor" />
              ) : (
                <Play size={26} fill="currentColor" className="ml-0.5" />
              )}
            </motion.span>
          </AnimatePresence>
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
          style={{ color: accent }}
        />
        <Volume2 size={16} className="text-[var(--text-tertiary)]" />
        <span className="w-9 text-right text-xs text-[var(--text-tertiary)]">{localVolume}%</span>
      </div>
    </motion.div>
  );
}
