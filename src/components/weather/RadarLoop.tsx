"use client";

import { useEffect, useState } from "react";
import { Pause, Play } from "lucide-react";
import { IconButton } from "@/components/ui/IconButton";

type RadarData = {
  background: string;
  topography: string;
  locations: string;
  range: string;
  frames: string[];
  warning?: string;
};

const FRAME_INTERVAL_MS = 500;

export function RadarLoop({ radarId }: { radarId: string }) {
  const [data, setData] = useState<RadarData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [frameIndex, setFrameIndex] = useState(0);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    fetch(`/api/weather/radar?radarId=${encodeURIComponent(radarId)}`)
      .then((res) => res.json())
      .then((body) => {
        if (body.error) throw new Error(body.error);
        setData(body);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Couldn't load radar."));
  }, [radarId]);

  useEffect(() => {
    if (!playing || !data || data.frames.length === 0) return;
    const interval = setInterval(() => {
      setFrameIndex((i) => (i + 1) % data.frames.length);
    }, FRAME_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [playing, data]);

  if (error) return null; // Radar is a bonus visual, not worth an alarming error banner.
  if (!data) return <p className="text-center text-xs text-[var(--text-tertiary)]">Loading radar…</p>;

  return (
    <div className="mx-auto max-w-md">
      <div className="relative aspect-square overflow-hidden rounded-2xl border border-[var(--border)] bg-black/40">
        {/* eslint-disable-next-line @next/next/no-img-element -- external BOM imagery, not a local/optimizable asset */}
        <img src={data.background} alt="" className="absolute inset-0 h-full w-full object-cover" />
        {data.frames[frameIndex] && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={data.frames[frameIndex]}
            alt="Rain radar"
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={data.locations} alt="" className="absolute inset-0 h-full w-full object-cover" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={data.range} alt="" className="absolute inset-0 h-full w-full object-cover" />
      </div>

      <div className="mt-2 flex items-center justify-center gap-3">
        <IconButton
          size="sm"
          onClick={() => setPlaying((p) => !p)}
          disabled={data.frames.length === 0}
          aria-label={playing ? "Pause radar loop" : "Play radar loop"}
        >
          {playing ? <Pause size={13} /> : <Play size={13} />}
        </IconButton>
        <span className="text-xs text-[var(--text-tertiary)]">
          {data.warning ?? "Rain radar, last hour"}
        </span>
      </div>
    </div>
  );
}
