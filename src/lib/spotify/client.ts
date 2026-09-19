import type { SpotifyDevice, SpotifyPlaybackState } from "./types";

const API_BASE = "https://api.spotify.com/v1";

export class SpotifyApiError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message);
  }
}

async function api(
  accessToken: string,
  path: string,
  init?: RequestInit
): Promise<Response> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
  });

  if (res.status === 401) {
    throw new SpotifyApiError("Spotify session expired.", 401);
  }
  if (res.status === 403) {
    throw new SpotifyApiError(
      "Spotify Premium is required for playback control.",
      403
    );
  }
  if (res.status === 404) {
    throw new SpotifyApiError("No active Spotify device found.", 404);
  }
  if (!res.ok && res.status !== 204) {
    throw new SpotifyApiError(`Spotify request failed (${res.status})`, res.status);
  }

  return res;
}

export async function getPlaybackState(
  accessToken: string
): Promise<SpotifyPlaybackState | null> {
  const res = await api(accessToken, "/me/player");
  if (res.status === 204) return null;
  return (await res.json()) as SpotifyPlaybackState;
}

export async function getDevices(accessToken: string): Promise<SpotifyDevice[]> {
  const res = await api(accessToken, "/me/player/devices");
  const body = (await res.json()) as { devices: SpotifyDevice[] };
  return body.devices;
}

export async function play(accessToken: string, deviceId?: string): Promise<void> {
  const query = deviceId ? `?device_id=${encodeURIComponent(deviceId)}` : "";
  await api(accessToken, `/me/player/play${query}`, { method: "PUT" });
}

export async function pause(accessToken: string): Promise<void> {
  await api(accessToken, "/me/player/pause", { method: "PUT" });
}

export async function skipNext(accessToken: string): Promise<void> {
  await api(accessToken, "/me/player/next", { method: "POST" });
}

export async function skipPrevious(accessToken: string): Promise<void> {
  await api(accessToken, "/me/player/previous", { method: "POST" });
}

export async function setVolume(accessToken: string, volumePercent: number): Promise<void> {
  await api(accessToken, `/me/player/volume?volume_percent=${Math.round(volumePercent)}`, {
    method: "PUT",
  });
}

export async function transferPlayback(
  accessToken: string,
  deviceId: string,
  play = false
): Promise<void> {
  await api(accessToken, "/me/player", {
    method: "PUT",
    body: JSON.stringify({ device_ids: [deviceId], play }),
  });
}
