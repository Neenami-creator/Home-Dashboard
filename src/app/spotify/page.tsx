"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { PanelShell } from "@/components/PanelShell";
import { ConnectSpotify } from "@/components/spotify/ConnectSpotify";
import { NowPlayingCard } from "@/components/spotify/NowPlayingCard";
import { DevicePicker } from "@/components/spotify/DevicePicker";
import { StaleBadge } from "@/components/ui/StaleBadge";
import { disconnect, getValidAccessToken } from "@/lib/spotify/auth";
import { loadClientId } from "@/lib/spotify/config";
import {
  getDevices,
  getPlaybackState,
  pause,
  play,
  setVolume,
  skipNext,
  skipPrevious,
  transferPlayback,
  SpotifyApiError,
} from "@/lib/spotify/client";
import { loadCache, saveCache } from "@/lib/cache";
import type { SpotifyDevice, SpotifyPlaybackState } from "@/lib/spotify/types";

// Spotify's Web API has no push mechanism for playback state, so this still
// polls - but there's no reason to hit it every 5s when nothing is playing.
// Polling speeds up the moment something starts, and any user-initiated
// control (see withToken below) refreshes immediately regardless of timing.
const ACTIVE_POLL_MS = 5_000;
const IDLE_POLL_MS = 25_000;
const CACHE_KEY = "spotify-last-playback";

export default function SpotifyPage() {
  const [clientId, setClientId] = useState<string | null | undefined>(undefined);
  const [playback, setPlayback] = useState<SpotifyPlaybackState | null>(null);
  const [devices, setDevices] = useState<SpotifyDevice[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [connected, setConnected] = useState(false);
  const [staleSince, setStaleSince] = useState<number | null>(null);

  const playbackRef = useRef<SpotifyPlaybackState | null>(null);
  useEffect(() => {
    playbackRef.current = playback;
  }, [playback]);

  useEffect(() => {
    // Reads localStorage, which isn't available during server rendering.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setClientId(loadClientId());
  }, []);

  const refresh = useCallback(async () => {
    if (!clientId) return;
    const accessToken = await getValidAccessToken(clientId);
    if (!accessToken) {
      setConnected(false);
      return;
    }
    setConnected(true);
    try {
      const [state, deviceList] = await Promise.all([
        getPlaybackState(accessToken),
        getDevices(accessToken),
      ]);
      setPlayback(state);
      setDevices(deviceList);
      setError(null);
      setStaleSince(null);
      if (state) saveCache(CACHE_KEY, state);
    } catch (err) {
      if (err instanceof SpotifyApiError && err.status === 401) {
        setConnected(false);
        return;
      }
      setError(err instanceof Error ? err.message : "Couldn't reach Spotify.");
      // Cold load with nothing fetched yet this session - fall back to the
      // last known track rather than implying nothing is playing.
      setPlayback((prev) => {
        if (prev) return prev;
        const cached = loadCache<SpotifyPlaybackState>(CACHE_KEY);
        if (cached) setStaleSince(cached.savedAt);
        return cached?.data ?? prev;
      });
    }
  }, [clientId]);

  useEffect(() => {
    if (clientId === undefined) return;
    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout>;

    async function tick() {
      await refresh();
      if (cancelled) return;
      const delay = playbackRef.current?.is_playing ? ACTIVE_POLL_MS : IDLE_POLL_MS;
      timeoutId = setTimeout(tick, delay);
    }

    tick();
    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [clientId, refresh]);

  async function withToken(action: (accessToken: string) => Promise<void>) {
    if (!clientId) return;
    const accessToken = await getValidAccessToken(clientId);
    if (!accessToken) {
      setConnected(false);
      return;
    }
    setBusy(true);
    try {
      await action(accessToken);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "That didn't work.");
    } finally {
      setBusy(false);
    }
  }

  if (clientId === undefined) {
    return (
      <PanelShell title="Spotify" accent="var(--accent-spotify)">
        <p className="text-[var(--text-secondary)]">Loading…</p>
      </PanelShell>
    );
  }

  if (!connected) {
    return (
      <PanelShell title="Spotify" accent="var(--accent-spotify)">
        <ConnectSpotify initialClientId={clientId} />
      </PanelShell>
    );
  }

  return (
    <PanelShell title="Spotify" accent="var(--accent-spotify)">
      {staleSince !== null && (
        <div className="mb-4 flex justify-center">
          <StaleBadge savedAt={staleSince} />
        </div>
      )}

      {error && (
        <div className="mb-6 rounded-xl border border-red-400/30 bg-red-400/10 p-4 text-center text-sm text-red-300">
          {error}
        </div>
      )}

      {playback ? (
        <NowPlayingCard
          state={playback}
          busy={busy}
          onPlayPause={() =>
            withToken((token) => (playback.is_playing ? pause(token) : play(token)))
          }
          onNext={() => withToken(skipNext)}
          onPrevious={() => withToken(skipPrevious)}
          onVolume={(percent) => withToken((token) => setVolume(token, percent))}
        />
      ) : (
        <p className="text-center text-[var(--text-secondary)]">
          Nothing playing. Start something on a Spotify Connect device below.
        </p>
      )}

      <div className="mt-10">
        <h2 className="mb-3 text-center text-sm uppercase tracking-wide text-[var(--text-tertiary)]">
          Devices
        </h2>
        <DevicePicker
          devices={devices}
          busy={busy}
          onSelect={(deviceId) => withToken((token) => transferPlayback(token, deviceId, true))}
        />
      </div>

      <button
        type="button"
        onClick={() => {
          disconnect();
          setConnected(false);
          setPlayback(null);
        }}
        className="mx-auto mt-8 block text-xs text-[var(--text-tertiary)] underline underline-offset-2"
      >
        Disconnect Spotify
      </button>
    </PanelShell>
  );
}
