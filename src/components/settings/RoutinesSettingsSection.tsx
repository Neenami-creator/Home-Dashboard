"use client";

import { useEffect, useState } from "react";
import { Sparkles, Trash2 } from "lucide-react";
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
      <h2 className="mb-1 flex items-center gap-2">
        <Sparkles size={16} strokeWidth={1.7} className="text-[var(--accent-hue)]" />
        <span className="instrument-label">Routines</span>
      </h2>
      <p className="mb-3 text-[14px] text-[var(--text-secondary)]">
        One-tap shortcuts on the home screen. Assign a Hue scene per room for each routine, and
        optionally pause Spotify.
      </p>

      {rooms.length === 0 && (
        <p className="mb-3 text-[12px] text-[var(--text-tertiary)]">
          Connect a Hue bridge above to assign scenes to routines.
        </p>
      )}

      <div className="space-y-3">
        {routines.map((routine) => {
          const Icon = ROUTINE_ICONS[routine.icon];
          return (
            <div key={routine.id} className="control-surface p-5">
              <div className="mb-3 flex items-center justify-between">
                <span className="flex items-center gap-2 text-[15px] font-medium">
                  <Icon size={16} strokeWidth={1.7} className="text-[var(--text-secondary)]" />
                  {routine.name}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemove(routine.id)}
                  aria-label={`Delete ${routine.name}`}
                  className="text-[var(--text-tertiary)] transition-colors hover:text-red-400"
                >
                  <Trash2 size={15} strokeWidth={1.7} />
                </button>
              </div>

              {rooms.length > 0 && (
                <div className="space-y-2">
                  {rooms.map((room) => (
                    <div key={room.id} className="flex items-center justify-between gap-3 text-[14px]">
                      <span className="text-[var(--text-secondary)]">{room.name}</span>
                      <select
                        value={routine.sceneByRoom[room.id] ?? ""}
                        onChange={(e) => setRoomScene(routine.id, room.id, e.target.value)}
                        className="h-9 rounded-[10px] border border-[var(--border)] bg-[var(--surface-2)] px-2 text-[13px] text-[var(--foreground)] outline-none transition-colors focus:border-[var(--border-strong)] focus:ring-2 focus:ring-white/10"
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

              <label className="mt-3 flex items-center gap-2 text-[14px] text-[var(--text-secondary)]">
                <input
                  type="checkbox"
                  checked={routine.pauseSpotify}
                  onChange={(e) => setPauseSpotify(routine.id, e.target.checked)}
                  className="accent-[var(--foreground)]"
                />
                Also pause Spotify
              </label>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex gap-2">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New routine name"
          className="h-11 flex-1 rounded-[12px] border border-[var(--border)] bg-[var(--surface-2)] px-3 text-[14px] text-[var(--foreground)] outline-none transition-colors focus:border-[var(--border-strong)] focus:ring-2 focus:ring-white/10"
        />
        <button
          type="button"
          onClick={handleAdd}
          className="h-11 rounded-[12px] border border-[var(--border)] bg-[var(--surface-2)] px-4 text-[14px] text-[var(--text-secondary)] shadow-[inset_0_1px_0_var(--inset-highlight)] transition-colors hover:border-[var(--border-strong)]"
        >
          Add
        </button>
      </div>
    </section>
  );
}
