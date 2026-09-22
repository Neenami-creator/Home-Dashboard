"use client";

import Image from "next/image";
import { useEffect, useState, type CSSProperties } from "react";
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
      data-active={state.is_playing}
      style={{ "--accent": accent } as CSSProperties}
      className="control-surface relative mx-auto flex max-w-3xl flex-col items-center gap-6 p-8 sm:flex-row sm:items-center sm:gap-8"
    >
      {/* Blurred, low-opacity copy of the current artwork as an ambient
          backdrop - the "album art carries the color" treatment, kept
          restrained so it reads as atmosphere rather than a busy background. */}
      {artwork && (
        <div
          className="pointer-events-none absolute inset-0 overflow-hidden opacity-[0.08]"
          style={{
            backgroundImage: `url(${artwork})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "blur(90px)",
            transform: "scale(1.3)",
          }}
        />
      )}

      <AnimatePresence mode="wait">
        {artwork ? (
          <motion.div
            key={artwork}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="relative shrink-0"
          >
            <Image
              src={artwork}
              alt={track?.album.name ?? "Album art"}
              width={220}
              height={220}
              className="rounded-[14px] shadow-[0_18px_40px_rgba(0,0,0,0.35)]"
              unoptimized
            />
          </motion.div>
        ) : (
          <div className="relative flex h-[220px] w-[220px] shrink-0 items-center justify-center rounded-[14px] border border-[var(--border)] bg-[var(--surface-2)] text-[var(--text-tertiary)]">
            No artwork
          </div>
        )}
      </AnimatePresence>

      <div className="relative flex w-full flex-col gap-5">
        <AnimatePresence mode="wait">
          <motion.div
            key={track?.name ?? "nothing"}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
            className="text-center sm:text-left"
          >
            <p className="instrument-label">Now Playing</p>
            <p className="font-display mt-1.5 text-[28px] leading-tight font-normal sm:text-[32px]">
              {track?.name ?? "Nothing playing"}
            </p>
            <p className="mt-1 text-[16px] text-[var(--text-secondary)]">
              {track?.artists.map((a) => a.name).join(", ") ?? "—"}
            </p>
            {state.device && (
              <p className="mt-2 flex items-center justify-center gap-1.5 text-[13px] text-[var(--text-tertiary)] sm:justify-start">
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: state.is_playing ? "var(--accent-spotify)" : "var(--border-strong)" }}
                />
                Playing on {state.device.name}
              </p>
            )}
          </motion.div>
        </AnimatePresence>

        {track && (
          <div className="text-[12px] text-[var(--text-tertiary)]">
            <div className="flex justify-between">
              <span>{formatMs(state.progress_ms ?? 0)}</span>
              <span>{formatMs(track.duration_ms)}</span>
            </div>
            <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-[var(--surface-2)]">
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

        <div className="flex items-center justify-center gap-5 sm:justify-start">
          <IconButton onClick={onPrevious} disabled={busy} size="control" aria-label="Previous track">
            <SkipBack size={19} strokeWidth={1.7} fill="currentColor" />
          </IconButton>
          <IconButton
            onClick={onPlayPause}
            disabled={busy}
            size="play"
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
                  <Pause size={24} fill="currentColor" />
                ) : (
                  <Play size={24} fill="currentColor" className="ml-0.5" />
                )}
              </motion.span>
            </AnimatePresence>
          </IconButton>
          <IconButton onClick={onNext} disabled={busy} size="control" aria-label="Next track">
            <SkipForward size={19} strokeWidth={1.7} fill="currentColor" />
          </IconButton>
        </div>

        <div className="flex w-full items-center gap-3">
          <Volume1 size={15} strokeWidth={1.7} className="text-[var(--text-tertiary)]" />
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
          <Volume2 size={15} strokeWidth={1.7} className="text-[var(--text-tertiary)]" />
          <span className="w-9 text-right text-[12px] text-[var(--text-tertiary)]">{localVolume}%</span>
        </div>
      </div>
    </motion.div>
  );
}
