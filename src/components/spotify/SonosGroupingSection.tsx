"use client";

import { useEffect, useState } from "react";
import { Speaker, Users } from "lucide-react";
import { saveTokens, clearTokens, isConnected, clientId } from "@/lib/sonos/config";
import { startAuthFlow, getValidAccessToken } from "@/lib/sonos/auth";
import { fetchHouseholds, fetchGroups, createGroup, setGroupVolume, SonosApiError } from "@/lib/sonos/client";
import type { SonosGroup, SonosPlayer } from "@/lib/sonos/types";

// Sonos grouping is a distinct integration from Spotify - Spotify's own API
// has no concept of it at all - so this section only appears once a Sonos
// Client ID is configured, and is clearly its own connect flow. See the
// unverified-endpoints note in src/lib/sonos/server.ts before relying on
// group creation actually working.
export function SonosGroupingSection() {
  const [connected, setConnected] = useState(false);
  const [householdId, setHouseholdId] = useState<string | null>(null);
  const [groups, setGroups] = useState<SonosGroup[]>([]);
  const [players, setPlayers] = useState<SonosPlayer[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selecting, setSelecting] = useState(false);
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);

  // Picks up tokens (or an error) landed in the URL after the OAuth
  // redirect from /api/sonos/callback, then cleans the URL.
  useEffect(() => {
    const hash = new URLSearchParams(window.location.hash.slice(1));
    const accessToken = hash.get("sonos_access_token");
    const refreshTokenValue = hash.get("sonos_refresh_token");
    const expiresIn = hash.get("sonos_expires_in");
    const params = new URLSearchParams(window.location.search);
    const oauthError = params.get("sonos_error");

    if (accessToken && refreshTokenValue && expiresIn) {
      saveTokens({
        accessToken,
        refreshToken: refreshTokenValue,
        expiresAt: Date.now() + Number(expiresIn) * 1000,
      });
      window.history.replaceState(null, "", window.location.pathname);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setConnected(true);
    } else if (oauthError) {
      setError(`Sonos connection failed: ${oauthError}`);
      window.history.replaceState(null, "", window.location.pathname);
    } else {
      setConnected(isConnected());
    }
  }, []);

  useEffect(() => {
    if (!connected) return;
    let cancelled = false;

    async function load() {
      const accessToken = await getValidAccessToken();
      if (!accessToken) {
        if (!cancelled) setConnected(false);
        return;
      }
      try {
        const households = await fetchHouseholds(accessToken);
        const household = households[0];
        if (!household) return;
        const { groups: g, players: p } = await fetchGroups(accessToken, household.id);
        if (!cancelled) {
          setHouseholdId(household.id);
          setGroups(g);
          setPlayers(p);
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof SonosApiError ? err.message : "Couldn't load Sonos groups.");
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [connected]);

  function playerName(id: string): string {
    return players.find((p) => p.id === id)?.name ?? id;
  }

  async function handleCreateGroup() {
    if (!householdId || selectedPlayerIds.size < 2) return;
    setBusy(true);
    try {
      const accessToken = await getValidAccessToken();
      if (!accessToken) throw new SonosApiError("Not connected.");
      await createGroup(accessToken, householdId, [...selectedPlayerIds]);
      const { groups: g } = await fetchGroups(accessToken, householdId);
      setGroups(g);
      setSelecting(false);
      setSelectedPlayerIds(new Set());
    } catch (err) {
      setError(err instanceof SonosApiError ? err.message : "Couldn't create that group.");
    } finally {
      setBusy(false);
    }
  }

  async function handleVolumeChange(groupId: string, volume: number) {
    try {
      const accessToken = await getValidAccessToken();
      if (accessToken) await setGroupVolume(accessToken, groupId, volume);
    } catch {
      // Best-effort - volume slider staying where the user left it is fine.
    }
  }

  if (!clientId()) return null;

  if (!connected) {
    return (
      <div className="mt-10 flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={startAuthFlow}
          className="flex items-center gap-2 rounded-[12px] border border-[var(--border)] bg-[var(--surface-2)] px-4 py-2 text-[13px] text-[var(--text-secondary)] shadow-[inset_0_1px_0_var(--inset-highlight)] transition-colors hover:border-[var(--border-strong)]"
        >
          <Users size={14} strokeWidth={1.7} />
          Connect Sonos for multi-room grouping
        </button>
        {error && <p className="text-[12px] text-red-400">{error}</p>}
      </div>
    );
  }

  return (
    <div className="mt-10">
      <p className="instrument-label mb-3 text-center">Sonos Groups</p>

      {error && <p className="mb-3 text-center text-[12px] text-red-400">{error}</p>}

      <div className="space-y-3">
        {groups.map((group) => (
          <div
            key={group.id}
            className="flex items-center justify-between gap-3 rounded-[14px] border border-[var(--border)] bg-[var(--surface-2)] p-3 shadow-[inset_0_1px_0_var(--inset-highlight)]"
          >
            <span className="flex items-center gap-2 text-[14px]">
              <Speaker size={14} strokeWidth={1.7} className="text-[var(--accent-spotify)]" />
              {group.playerIds.map(playerName).join(" + ")}
            </span>
            <input
              type="range"
              min={0}
              max={100}
              defaultValue={50}
              onPointerUp={(e) => handleVolumeChange(group.id, Number(e.currentTarget.value))}
              className="w-24 accent-[var(--accent-spotify)]"
            />
          </div>
        ))}
      </div>

      {selecting ? (
        <div className="mt-4 rounded-[14px] border border-[var(--border)] bg-[var(--surface-2)] p-4 shadow-[inset_0_1px_0_var(--inset-highlight)]">
          <p className="mb-2 text-[14px] text-[var(--text-secondary)]">Select speakers to group:</p>
          <div className="flex flex-wrap gap-2">
            {players.map((player) => {
              const isSelected = selectedPlayerIds.has(player.id);
              return (
                <button
                  key={player.id}
                  type="button"
                  onClick={() =>
                    setSelectedPlayerIds((prev) => {
                      const next = new Set(prev);
                      if (next.has(player.id)) next.delete(player.id);
                      else next.add(player.id);
                      return next;
                    })
                  }
                  className="rounded-[12px] border px-3 py-1.5 text-[12px] transition-colors"
                  style={
                    isSelected
                      ? { borderColor: "var(--border)", color: "var(--accent-spotify)", background: "var(--surface-hover)" }
                      : { borderColor: "var(--border)", color: "var(--text-secondary)" }
                  }
                >
                  {player.name}
                </button>
              );
            })}
          </div>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => setSelecting(false)}
              className="flex-1 rounded-[12px] border border-[var(--border)] py-1.5 text-[14px] text-[var(--text-secondary)] transition-colors hover:border-[var(--border-strong)]"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={selectedPlayerIds.size < 2 || busy}
              onClick={handleCreateGroup}
              className="flex-1 rounded-[12px] py-1.5 text-[14px] font-medium text-black disabled:opacity-50"
              style={{ background: "var(--accent-spotify)" }}
            >
              Group
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setSelecting(true)}
          className="mx-auto mt-4 block text-[12px] text-[var(--text-tertiary)] underline underline-offset-2 transition-colors hover:text-[var(--text-secondary)]"
        >
          + New group
        </button>
      )}

      <button
        type="button"
        onClick={() => {
          clearTokens();
          setConnected(false);
        }}
        className="mx-auto mt-6 block text-[12px] text-[var(--text-tertiary)] underline underline-offset-2 transition-colors hover:text-[var(--text-secondary)]"
      >
        Disconnect Sonos
      </button>
    </div>
  );
}
