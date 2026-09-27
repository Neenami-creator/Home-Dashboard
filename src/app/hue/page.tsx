"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "motion/react";
import { PanelShell } from "@/components/PanelShell";
import { BridgeSettings } from "@/components/hue/BridgeSettings";
import { RoomTile } from "@/components/hue/RoomTile";
import { BrightnessPanel } from "@/components/hue/BrightnessPanel";
import { SceneCard } from "@/components/hue/SceneCard";
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
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [activeSceneId, setActiveSceneId] = useState<string | null>(null);
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

  useEffect(() => {
    if (selectedRoomId || rooms.length === 0) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedRoomId(rooms[0].id);
  }, [rooms, selectedRoomId]);

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
      setActiveSceneId(sceneId);
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
      <PanelShell title="Lighting" accent="var(--accent-hue)">
        <p className="text-[var(--text-secondary)]">Loading…</p>
      </PanelShell>
    );
  }

  if (!config) {
    return (
      <PanelShell title="Lighting" accent="var(--accent-hue)">
        <BridgeSettings initial={null} onSave={(cfg) => {
          saveBridgeConfig(cfg);
          setConfig(cfg);
        }} />
      </PanelShell>
    );
  }

  const onCount = rooms.filter((r) => r.on).length;
  const selectedRoom = rooms.find((r) => r.id === selectedRoomId);
  const roomScenes = selectedRoomId ? scenes.filter((s) => s.roomId === selectedRoomId) : [];

  return (
    <PanelShell
      title="Lighting"
      accent="var(--accent-hue)"
      status={rooms.length > 0 ? `${onCount} of ${rooms.length} lights on` : undefined}
    >
      {staleSince !== null && (
        <div className="mb-4 flex justify-center">
          <StaleBadge savedAt={staleSince} />
        </div>
      )}

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-[12px] border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 text-[14px] text-[var(--text-secondary)]">
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-red-400" />
          {error}
        </div>
      )}

      {rooms.length === 0 && !error && (
        <p className="text-[var(--text-secondary)]">Looking for rooms on the bridge…</p>
      )}

      {rooms.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <motion.div
            variants={gridVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 gap-4 sm:grid-cols-2"
          >
            {rooms.map((room) => (
              <motion.div key={room.id} variants={tileVariants}>
                <RoomTile
                  room={room}
                  selected={room.id === selectedRoomId}
                  onSelect={() => {
                    setSelectedRoomId(room.id);
                    setActiveSceneId(null);
                  }}
                  onToggle={(on) => applyUpdate(room, { on })}
                  busy={busyRoomId === room.id}
                />
              </motion.div>
            ))}
          </motion.div>

          <BrightnessPanel
            room={selectedRoom}
            busy={busyRoomId === selectedRoom?.id}
            onBrightness={(brightness) => selectedRoom && applyUpdate(selectedRoom, { brightness })}
            onColor={(xy) => selectedRoom && applyUpdate(selectedRoom, { xy })}
          />
        </div>
      )}

      {roomScenes.length > 0 && (
        <div className="mt-8">
          <p className="instrument-label mb-3">Scenes</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {roomScenes.map((scene) => (
              <SceneCard
                key={scene.id}
                scene={scene}
                selected={activeSceneId === scene.id}
                busy={busyRoomId === selectedRoomId}
                onSelect={() => selectedRoom && applyScene(selectedRoom, scene.id)}
              />
            ))}
          </div>
        </div>
      )}

      <div className="mt-8 flex items-center justify-between">
        <span className="instrument-label flex items-center gap-1.5">
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
          className="text-[12px] text-[var(--text-tertiary)] underline underline-offset-2 transition-colors hover:text-[var(--text-secondary)]"
        >
          Forget this bridge
        </button>
      </div>
    </PanelShell>
  );
}
