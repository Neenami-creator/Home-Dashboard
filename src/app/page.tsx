"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Check } from "lucide-react";
import { PANELS } from "@/lib/panels";
import { Clock } from "@/components/Clock";
import { RoutineBar } from "@/components/routines/RoutineBar";
import { loadBridgeConfig } from "@/lib/hue/config";
import { fetchRoomStates, turnAllRoomsOff } from "@/lib/hue/client";
import { loadClientId } from "@/lib/spotify/config";
import { getValidAccessToken } from "@/lib/spotify/auth";
import { getPlaybackState, pause } from "@/lib/spotify/client";
import { loadCities, loadSelectedCityId } from "@/lib/weather/cities";
import { fetchCityWeather } from "@/lib/weather/client";
import { fetchRecipeCount } from "@/lib/recipes/queries";
import { useLongPress } from "@/lib/useLongPress";

// A home screen that's just a menu wastes the one thing worth glancing at
// on a wall: whether the lights are on, what's playing, and what it's like
// outside, without tapping in. Each panel resolves its own live snippet and
// falls back to its static description the moment anything isn't
// configured or reachable - this is a nice-to-know, never a blocker.
function useLiveStatus(href: string): string | null {
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const set = (value: string | null) => {
      if (!cancelled) setStatus(value);
    };

    async function loadHue() {
      const config = loadBridgeConfig();
      if (!config) return;
      const rooms = await fetchRoomStates(config);
      const onCount = rooms.filter((r) => r.on).length;
      set(rooms.length === 0 ? null : `${onCount} of ${rooms.length} lights on`);
    }

    async function loadSpotify() {
      const clientId = loadClientId();
      if (!clientId) return;
      const accessToken = await getValidAccessToken(clientId);
      if (!accessToken) return;
      const playback = await getPlaybackState(accessToken);
      if (!playback?.item) {
        set("Connected · nothing playing");
        return;
      }
      const artists = playback.item.artists.map((a) => a.name).join(", ");
      set(`${playback.is_playing ? "♪" : "⏸"} ${playback.item.name} — ${artists}`);
    }

    async function loadWeather() {
      const city = loadCities().find((c) => c.id === loadSelectedCityId());
      if (!city) return;
      const result = await fetchCityWeather(city);
      if (!result.current) return;
      const temp = result.current.airTempC !== null ? `${Math.round(result.current.airTempC)}°` : "";
      set(`${temp} ${result.current.conditionText ?? ""} · ${city.name}`.trim());
    }

    async function loadRecipes() {
      const count = await fetchRecipeCount();
      set(`${count} recipe${count === 1 ? "" : "s"}`);
    }

    const loaders: Record<string, () => Promise<void>> = {
      "/hue": loadHue,
      "/spotify": loadSpotify,
      "/weather": loadWeather,
      "/recipes": loadRecipes,
    };

    loaders[href]?.().catch(() => set(null));
    return () => {
      cancelled = true;
    };
  }, [href]);

  return status;
}

// Long-press a tile to fire a "kill switch" without navigating into the
// panel first - all lights off, or pause whatever's playing. Only defined
// where a single obvious one-tap action exists.
const QUICK_ACTIONS: Record<string, () => Promise<void>> = {
  "/hue": async () => {
    const config = loadBridgeConfig();
    if (config) await turnAllRoomsOff(config);
  },
  "/spotify": async () => {
    const clientId = loadClientId();
    if (!clientId) return;
    const accessToken = await getValidAccessToken(clientId);
    if (accessToken) await pause(accessToken);
  },
};

const QUICK_ACTION_LABELS: Record<string, string> = {
  "/hue": "All lights off",
  "/spotify": "Paused",
};

const gridVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};
const tileVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

function PanelTile({ panel }: { panel: (typeof PANELS)[number] }) {
  const liveStatus = useLiveStatus(panel.href);
  const Icon = panel.icon;
  const [justRanAction, setJustRanAction] = useState(false);
  const quickAction = QUICK_ACTIONS[panel.href];

  const longPress = useLongPress(() => {
    if (!quickAction) return;
    quickAction()
      .then(() => {
        setJustRanAction(true);
        setTimeout(() => setJustRanAction(false), 1500);
      })
      .catch(() => {});
  });

  return (
    <motion.div variants={tileVariants}>
      <Link
        href={panel.href}
        onPointerDown={longPress.onPointerDown}
        onPointerUp={longPress.onPointerUp}
        onPointerLeave={longPress.onPointerLeave}
        onPointerCancel={longPress.onPointerCancel}
        onClick={(e) => {
          if (longPress.wasLongPress()) e.preventDefault();
        }}
        className="group relative flex aspect-square flex-col justify-between overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 transition hover:border-[var(--border-strong)] hover:bg-[var(--surface-hover)]"
      >
        <div
          className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full opacity-20 blur-3xl transition group-hover:opacity-30"
          style={{ backgroundColor: panel.accent }}
        />
        <div
          className="flex h-12 w-12 items-center justify-center rounded-2xl"
          style={{ backgroundColor: `color-mix(in srgb, ${panel.accent} 18%, transparent)`, color: panel.accent }}
        >
          <Icon size={24} />
        </div>
        <div>
          <span className="font-display block text-2xl font-medium">{panel.name}</span>
          <span className="mt-1 flex items-center gap-1.5 truncate text-sm text-[var(--text-secondary)]">
            {justRanAction && <Check size={14} className="shrink-0" style={{ color: panel.accent }} />}
            {justRanAction ? QUICK_ACTION_LABELS[panel.href] : (liveStatus ?? panel.description)}
          </span>
        </div>
      </Link>
    </motion.div>
  );
}

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-10 p-8">
      <div className="text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-[var(--text-tertiary)]">
          Home Dashboard
        </p>
        <div className="mt-3">
          <Clock className="[&_p:first-child]:text-center [&_p:first-child]:text-5xl [&_p:last-child]:text-center [&_p:last-child]:text-sm" />
        </div>
      </div>

      <RoutineBar />

      <motion.div
        variants={gridVariants}
        initial="hidden"
        animate="visible"
        className="grid w-full max-w-3xl grid-cols-2 gap-5"
      >
        {PANELS.map((panel) => (
          <PanelTile key={panel.href} panel={panel} />
        ))}
      </motion.div>
    </div>
  );
}
