"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "motion/react";
import { PanelShell } from "@/components/PanelShell";
import { BridgeSettings } from "@/components/hue/BridgeSettings";
import { RoomTile } from "@/components/hue/RoomTile";
import { StaleBadge } from "@/components/ui/StaleBadge";
import { loadBridgeConfig, saveBridgeConfig, clearBridgeConfig } from "@/lib/hue/config";
import {
  fetchRoomStates,
  fetchScenes,
  recallScene,
  setGroupedLightState,
  HueBridgeError,
} from "@/lib/hue/client";
import { subscribeToHueEvents } from "@/lib/hue/eventstream";
import { loadCache, saveCache } from "@/lib/cache";
import type { BridgeConfig, HueRoomState, HueScene } from "@/lib/hue/types";

// The event stream (see below) delivers changes the instant they happen -
// from this panel, the Hue app, a physical switch, or a schedule - so this
// is only a safety net in case the stream silently drops.
const SAFETY_POLL_INTERVAL_MS = 60_000;
const CACHE_KEY = "hue-rooms";

const gridVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
};
const tileVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

export default function HuePage() {
  const [config, setConfig] = useState<BridgeConfig | null | undefined>(undefined);
  const [rooms, setRooms] = useState<HueRoomState[]>([]);
  const [scenes, setScenes] = useState<HueScene[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busyRoomId, setBusyRoomId] = useState<string | null>(null);
  const [live, setLive] = useState(false);
  const [staleSince, setStaleSince] = useState<number | null>(null);

  useEffect(() => {
    // Reads localStorage, which isn't available during server rendering.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setConfig(loadBridgeConfig());
  }, []);

  const refresh = useCallback(async (cfg: BridgeConfig) => {
    try {
      const [states, sceneList] = await Promise.all([fetchRoomStates(cfg), fetchScenes(cfg)]);
      setRooms(states);
      setScenes(sceneList);
      setError(null);
      setStaleSince(null);
      saveCache(CACHE_KEY, states);
    } catch (err) {
      setError(err instanceof HueBridgeError ? err.message : "Couldn't load rooms.");
      // Cold load with no live data yet (e.g. page refreshed mid-outage) -
      // fall back to whatever we last knew rather than showing nothing.
      setRooms((prev) => {
        if (prev.length > 0) return prev;
        const cached = loadCache<HueRoomState[]>(CACHE_KEY);
        if (cached) setStaleSince(cached.savedAt);
        return cached?.data ?? prev;
      });
    }
  }, []);

  useEffect(() => {
    if (!config) return;
    // Fetches from the bridge on mount and on a low-frequency safety-net poll.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh(config);
    const interval = setInterval(() => refresh(config), SAFETY_POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [config, refresh]);

  useEffect(() => {
    if (!config) return;
    const unsubscribe = subscribeToHueEvents(
      config,
      (updates) => {
        setRooms((prev) =>
          prev.map((room) => {
            const update = updates.find((u) => u.groupedLightId === room.groupedLightId);
            if (!update) return room;
            return {
              ...room,
              on: update.on ?? room.on,
              brightness: update.brightness ?? room.brightness,
            };
          })
        );
      },
      (status) => setLive(status === "connected")
    );
    return unsubscribe;
  }, [config]);

  async function applyUpdate(
    room: HueRoomState,
    update: Parameters<typeof setGroupedLightState>[2]
  ) {
    if (!config || !room.groupedLightId) return;
    setBusyRoomId(room.id);
    // Optimistic update so the tile feels instant on a wall-mounted touchscreen.
    setRooms((prev) =>
      prev.map((r) =>
        r.id === room.id
          ? { ...r, on: update.on ?? r.on, brightness: update.brightness ?? r.brightness }
          : r
      )
    );
    try {
      await setGroupedLightState(config, room.groupedLightId, update);
    } catch (err) {
      setError(err instanceof HueBridgeError ? err.message : "Couldn't update the room.");
      refresh(config);
    } finally {
      setBusyRoomId(null);
    }
  }

  async function applyScene(room: HueRoomState, sceneId: string) {
    if (!config) return;
    setBusyRoomId(room.id);
    try {
      await recallScene(config, sceneId);
      // Scenes change on/brightness/color together; the event stream will
      // pick up the resulting grouped_light change, but nudge a refresh in
      // case that's slow to arrive.
      setTimeout(() => refresh(config), 500);
    } catch (err) {
      setError(err instanceof HueBridgeError ? err.message : "Couldn't recall that scene.");
    } finally {
      setBusyRoomId(null);
    }
  }

  if (config === undefined) {
    return (
      <PanelShell title="Hue Lights" accent="var(--accent-hue)">
        <p className="text-[var(--text-secondary)]">Loading…</p>
      </PanelShell>
    );
  }

  if (!config) {
    return (
      <PanelShell title="Hue Lights" accent="var(--accent-hue)">
        <BridgeSettings initial={null} onSave={(cfg) => {
          saveBridgeConfig(cfg);
          setConfig(cfg);
        }} />
      </PanelShell>
    );
  }

  return (
    <PanelShell title="Hue Lights" accent="var(--accent-hue)">
      {staleSince !== null && (
        <div className="mb-4 flex justify-center">
          <StaleBadge savedAt={staleSince} />
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-xl border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      {rooms.length === 0 && !error && (
        <p className="text-[var(--text-secondary)]">Looking for rooms on the bridge…</p>
      )}

      <motion.div
        variants={gridVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {rooms.map((room) => (
          <motion.div key={room.id} variants={tileVariants}>
            <RoomTile
              room={room}
              scenes={scenes.filter((s) => s.roomId === room.id)}
              busy={busyRoomId === room.id}
              onToggle={(on) => applyUpdate(room, { on })}
              onBrightness={(brightness) => applyUpdate(room, { brightness })}
              onColor={(xy) => applyUpdate(room, { xy })}
              onScene={(sceneId) => applyScene(room, sceneId)}
            />
          </motion.div>
        ))}
      </motion.div>

      <div className="mt-8 flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-xs text-[var(--text-tertiary)]">
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: live ? "var(--accent-hue)" : "var(--border-strong)" }}
          />
          {live ? "Live" : "Reconnecting…"}
        </span>
        <button
          type="button"
          onClick={() => {
            clearBridgeConfig();
            setConfig(null);
          }}
          className="text-xs text-[var(--text-tertiary)] underline underline-offset-2"
        >
          Forget this bridge
        </button>
      </div>
    </PanelShell>
  );
}
