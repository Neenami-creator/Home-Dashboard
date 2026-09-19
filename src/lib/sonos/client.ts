import type { SonosGroup, SonosHousehold, SonosPlayer } from "./types";

// See the UNVERIFIED note in src/lib/sonos/server.ts - these paths and
// response shapes are built from documentation knowledge, not confirmed
// against a live Sonos Control API response from this sandbox.
const API_BASE = "https://api.ws.sonos.com/control/api/v1";

export class SonosApiError extends Error {}

async function api(accessToken: string, path: string, init?: RequestInit): Promise<Response> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
  });
  if (!res.ok) {
    throw new SonosApiError(`Sonos request failed (${res.status})`);
  }
  return res;
}

export async function fetchHouseholds(accessToken: string): Promise<SonosHousehold[]> {
  const res = await api(accessToken, "/households");
  const body = (await res.json()) as { households: { id: string }[] };
  return body.households;
}

export async function fetchGroups(
  accessToken: string,
  householdId: string
): Promise<{ groups: SonosGroup[]; players: SonosPlayer[] }> {
  const res = await api(accessToken, `/households/${householdId}/groups`);
  const body = (await res.json()) as {
    groups: { id: string; name: string; coordinatorId: string; playerIds: string[] }[];
    players: { id: string; name: string }[];
  };
  return {
    groups: body.groups.map((g) => ({
      id: g.id,
      name: g.name,
      coordinatorId: g.coordinatorId,
      playerIds: g.playerIds,
    })),
    players: body.players.map((p) => ({ id: p.id, name: p.name })),
  };
}

export async function createGroup(
  accessToken: string,
  householdId: string,
  playerIds: string[]
): Promise<void> {
  await api(accessToken, `/households/${householdId}/groups/createGroup`, {
    method: "POST",
    body: JSON.stringify({ playerIds }),
  });
}

export async function modifyGroupMembers(
  accessToken: string,
  groupId: string,
  update: { playerIdsToAdd?: string[]; playerIdsToRemove?: string[] }
): Promise<void> {
  await api(accessToken, `/groups/${groupId}/modifyGroupMembers`, {
    method: "POST",
    body: JSON.stringify(update),
  });
}

export async function setGroupVolume(accessToken: string, groupId: string, volume: number): Promise<void> {
  await api(accessToken, `/groups/${groupId}/groupVolume`, {
    method: "POST",
    body: JSON.stringify({ volume: Math.round(volume) }),
  });
}
