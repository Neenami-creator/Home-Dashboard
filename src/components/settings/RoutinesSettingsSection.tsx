"use client";

import { useEffect, useState } from "react";
import { Sparkles, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { loadBridgeConfig } from "@/lib/hue/config";
import { fetchRoomStates, fetchScenes } from "@/lib/hue/client";
import { loadRoutines, saveRoutines, addRoutine, removeRoutine } from "@/lib/routines/storage";
import { ROUTINE_ICONS } from "@/lib/routines/icons";
import type { Routine } from "@/lib/routines/types";
import type { HueRoomState, HueScene } from "@/lib/hue/types";

export function RoutinesSettingsSection() {
  const [routines, setRoutines] = useState<Routine[]>(loadRoutines());
  const [rooms, setRooms] = useState<HueRoomState[]>([]);
  const [scenes, setScenes] = useState<HueScene[]>([]);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    const config = loadBridgeConfig();
    if (!config) return;
    Promise.all([fetchRoomStates(config), fetchScenes(config)])
      .then(([r, s]) => {
        setRooms(r);
        setScenes(s);
      })
      .catch(() => {});
  }, []);

  function updateAndSave(next: Routine[]) {
    setRoutines(next);
    saveRoutines(next);
  }

  function setRoomScene(routineId: string, roomId: string, sceneId: string) {
    updateAndSave(
      routines.map((r) =>
        r.id === routineId
          ? { ...r, sceneByRoom: { ...r.sceneByRoom, [roomId]: sceneId || null } }
          : r
      )
    );
  }

  function setPauseSpotify(routineId: string, value: boolean) {
    updateAndSave(routines.map((r) => (r.id === routineId ? { ...r, pauseSpotify: value } : r)));
  }

  function handleAdd() {
    if (!newName.trim()) return;
    const routine: Routine = {
      id: `custom-${Date.now()}`,
      name: newName.trim(),
      icon: "custom",
      sceneByRoom: {},
      pauseSpotify: false,
    };
    addRoutine(routine);
    setRoutines(loadRoutines());
    setNewName("");
  }

  function handleRemove(id: string) {
    removeRoutine(id);
    setRoutines(loadRoutines());
  }

  return (
    <section>
      <h2 className="mb-1 flex items-center gap-2 text-lg font-medium">
        <Sparkles size={18} className="text-[var(--accent-hue)]" />
        Routines
      </h2>
      <p className="mb-3 text-sm text-[var(--text-secondary)]">
        One-tap shortcuts on the home screen. Assign a Hue scene per room for each routine, and
        optionally pause Spotify.
      </p>

      {rooms.length === 0 && (
        <p className="mb-3 text-xs text-[var(--text-tertiary)]">
          Connect a Hue bridge above to assign scenes to routines.
        </p>
      )}

      <div className="space-y-4">
        {routines.map((routine) => {
          const Icon = ROUTINE_ICONS[routine.icon];
          return (
            <Card key={routine.id} className="p-5">
              <div className="mb-3 flex items-center justify-between">
                <span className="flex items-center gap-2 font-medium">
                  <Icon size={16} className="text-[var(--text-secondary)]" />
                  {routine.name}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemove(routine.id)}
                  aria-label={`Delete ${routine.name}`}
                  className="text-[var(--text-tertiary)] hover:text-red-400"
                >
                  <Trash2 size={15} />
                </button>
              </div>

              {rooms.length > 0 && (
                <div className="space-y-2">
                  {rooms.map((room) => (
                    <div key={room.id} className="flex items-center justify-between gap-3 text-sm">
                      <span className="text-[var(--text-secondary)]">{room.name}</span>
                      <select
                        value={routine.sceneByRoom[room.id] ?? ""}
                        onChange={(e) => setRoomScene(routine.id, room.id, e.target.value)}
                        className="rounded-lg border border-[var(--border)] bg-black/30 px-2 py-1 text-sm text-[var(--foreground)]"
                      >
                        <option value="">No change</option>
                        {scenes
                          .filter((s) => s.roomId === room.id)
                          .map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.name}
                            </option>
                          ))}
                      </select>
                    </div>
                  ))}
                </div>
              )}

              <label className="mt-3 flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                <input
                  type="checkbox"
                  checked={routine.pauseSpotify}
                  onChange={(e) => setPauseSpotify(routine.id, e.target.checked)}
                />
                Also pause Spotify
              </label>
            </Card>
          );
        })}
      </div>

      <div className="mt-4 flex gap-2">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New routine name"
          className="flex-1 rounded-lg border border-[var(--border)] bg-black/30 px-3 py-2 text-sm text-[var(--foreground)]"
        />
        <button
          type="button"
          onClick={handleAdd}
          className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]"
        >
          Add
        </button>
      </div>
    </section>
  );
}
