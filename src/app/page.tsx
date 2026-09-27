"use client";

import Link from "next/link";
import { useEffect, useState, type CSSProperties } from "react";
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

  const isActive = Boolean(liveStatus);

  return (
    <motion.div variants={tileVariants} className="min-h-0">
      <Link
        href={panel.href}
        onPointerDown={longPress.onPointerDown}
        onPointerUp={longPress.onPointerUp}
        onPointerLeave={longPress.onPointerLeave}
        onPointerCancel={longPress.onPointerCancel}
        onClick={(e) => {
          if (longPress.wasLongPress()) e.preventDefault();
        }}
        data-active={isActive}
        style={{ "--accent": panel.accent } as CSSProperties}
        className="control-surface flex h-full min-h-0 flex-col overflow-hidden"
      >
        <div className="flex items-start justify-between p-5 pb-4">
          <div className="min-w-0">
            <span className="font-display block text-[21px] font-normal uppercase tracking-wide">
              {panel.label}
            </span>
            <span className="mt-1 flex items-center gap-1.5 truncate text-[14px] text-[var(--text-secondary)]">
              {justRanAction && <Check size={13} className="shrink-0" style={{ color: panel.accent }} />}
              {justRanAction ? QUICK_ACTION_LABELS[panel.href] : (liveStatus ?? panel.description)}
            </span>
          </div>
          <span
            className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
            style={{ backgroundColor: isActive ? panel.accent : "var(--border-strong)" }}
          />
        </div>
        <div className="media-tonal min-h-0 flex-1" style={{ "--accent": panel.accent } as CSSProperties} />
      </Link>
    </motion.div>
  );
}

function HomeWeatherSummary() {
  const status = useLiveStatus("/weather");
  if (!status) return null;
  const [temp, ...rest] = status.split(" ");
  return (
    <div>
      <p className="font-display text-[32px] font-normal leading-tight">{temp}</p>
      <p className="mt-0.5 text-[15px] text-[var(--text-secondary)]">{rest.join(" ")}</p>
    </div>
  );
}

export default function Home() {
  return (
    <div className="flex h-screen flex-col overflow-hidden px-8 py-7">
      <div className="flex justify-center pb-6">
        <RoutineBar />
      </div>

      <div className="flex min-h-0 flex-1 gap-8">
        <div className="flex w-[300px] shrink-0 flex-col justify-between">
          <div>
            <p className="instrument-label">Home</p>
            <Clock
              className="mt-3 [&_p:first-child]:font-display [&_p:first-child]:text-left [&_p:first-child]:text-[76px] [&_p:first-child]:font-normal [&_p:first-child]:leading-[0.9] [&_p:first-child]:tracking-[-0.035em]
                [&_p:last-child]:mt-2 [&_p:last-child]:text-left [&_p:last-child]:text-[13px] [&_p:last-child]:tracking-[0.06em] [&_p:last-child]:text-[var(--text-tertiary)]"
            />
          </div>
          <HomeWeatherSummary />
        </div>

        <motion.div
          variants={gridVariants}
          initial="hidden"
          animate="visible"
          className="grid min-h-0 flex-1 grid-cols-2 grid-rows-[repeat(2,minmax(0,1fr))] gap-4"
        >
          {PANELS.map((panel) => (
            <PanelTile key={panel.href} panel={panel} />
          ))}
        </motion.div>
      </div>
    </div>
  );
}
