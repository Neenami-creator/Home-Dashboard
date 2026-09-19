"use client";

import { useCallback, useEffect, useState } from "react";
import { PanelShell } from "@/components/PanelShell";
import { BridgeSettings } from "@/components/hue/BridgeSettings";
import { RoomTile } from "@/components/hue/RoomTile";
import { loadBridgeConfig, saveBridgeConfig, clearBridgeConfig } from "@/lib/hue/config";
import { fetchRoomStates, setGroupedLightState, HueBridgeError } from "@/lib/hue/client";
import type { BridgeConfig, HueRoomState } from "@/lib/hue/types";

const POLL_INTERVAL_MS = 15_000;

export default function HuePage() {
  const [config, setConfig] = useState<BridgeConfig | null | undefined>(undefined);
  const [rooms, setRooms] = useState<HueRoomState[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busyRoomId, setBusyRoomId] = useState<string | null>(null);

  useEffect(() => {
    // Reads localStorage, which isn't available during server rendering.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setConfig(loadBridgeConfig());
  }, []);

  const refresh = useCallback(async (cfg: BridgeConfig) => {
    try {
      const states = await fetchRoomStates(cfg);
      setRooms(states);
      setError(null);
    } catch (err) {
      setError(err instanceof HueBridgeError ? err.message : "Couldn't load rooms.");
    }
  }, []);

  useEffect(() => {
    if (!config) return;
    // Fetches from the bridge on mount and on a polling interval.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh(config);
    const interval = setInterval(() => refresh(config), POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [config, refresh]);

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
      {error && (
        <div className="mb-4 rounded-xl border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      {rooms.length === 0 && !error && (
        <p className="text-[var(--text-secondary)]">Looking for rooms on the bridge…</p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rooms.map((room) => (
          <RoomTile
            key={room.id}
            room={room}
            busy={busyRoomId === room.id}
            onToggle={(on) => applyUpdate(room, { on })}
            onBrightness={(brightness) => applyUpdate(room, { brightness })}
            onColor={(xy) => applyUpdate(room, { xy })}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={() => {
          clearBridgeConfig();
          setConfig(null);
        }}
        className="mt-8 text-xs text-[var(--text-tertiary)] underline underline-offset-2"
      >
        Forget this bridge
      </button>
    </PanelShell>
  );
}
