import type { BridgeConfig, HueGroupedLight, HueRoom, HueRoomState, HueScene, HueSceneResource } from "./types";

export class HueBridgeError extends Error {}

function bridgeUrl(config: BridgeConfig, path: string) {
  return `https://${config.ip}${path}`;
}

async function bridgeFetch<T>(
  config: BridgeConfig,
  path: string,
  init?: RequestInit
): Promise<T> {
  let res: Response;
  try {
    res = await fetch(bridgeUrl(config, path), {
      ...init,
      headers: {
        "hue-application-key": config.appKey,
        "Content-Type": "application/json",
        ...init?.headers,
      },
    });
  } catch {
    throw new HueBridgeError(
      "Couldn't reach the Hue bridge. Check you're on home WiFi and that this device has trusted the bridge's certificate (visit https://<bridge-ip> in Safari once)."
    );
  }

  if (!res.ok) {
    throw new HueBridgeError(`Hue bridge returned ${res.status} ${res.statusText}`);
  }

  const body = (await res.json()) as { data: T; errors?: { description: string }[] };
  if (body.errors && body.errors.length > 0) {
    throw new HueBridgeError(body.errors.map((e) => e.description).join("; "));
  }
  return body.data;
}

export async function fetchRoomStates(config: BridgeConfig): Promise<HueRoomState[]> {
  const [rooms, groupedLights] = await Promise.all([
    bridgeFetch<HueRoom[]>(config, "/clip/v2/resource/room"),
    bridgeFetch<HueGroupedLight[]>(config, "/clip/v2/resource/grouped_light"),
  ]);

  const groupedLightById = new Map(groupedLights.map((g) => [g.id, g]));

  return rooms
    .map((room): HueRoomState => {
      const groupedLightRef = room.services.find((s) => s.rtype === "grouped_light");
      const groupedLight = groupedLightRef ? groupedLightById.get(groupedLightRef.rid) : undefined;

      return {
        id: room.id,
        name: room.metadata.name,
        groupedLightId: groupedLightRef?.rid ?? null,
        on: groupedLight?.on.on ?? false,
        brightness: groupedLight?.dimming?.brightness ?? 0,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function setGroupedLightState(
  config: BridgeConfig,
  groupedLightId: string,
  update: {
    on?: boolean;
    brightness?: number; // 0-100
    xy?: [number, number];
  }
): Promise<void> {
  const body: Record<string, unknown> = {};
  if (update.on !== undefined) body.on = { on: update.on };
  if (update.brightness !== undefined) body.dimming = { brightness: update.brightness };
  if (update.xy !== undefined) body.color = { xy: { x: update.xy[0], y: update.xy[1] } };

  await bridgeFetch(config, `/clip/v2/resource/grouped_light/${groupedLightId}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export async function testBridgeConnection(config: BridgeConfig): Promise<void> {
  await bridgeFetch(config, "/clip/v2/resource/room");
}

// Real Hue scenes (Relax, Concentrate, whatever's configured in the Hue
// app), not just our own on/off/brightness/color controls - most people's
// day-to-day lighting habit is recalling a scene, not manually dialing in a
// color. Only scenes attached to a room (not a zone) are surfaced, since
// this dashboard's room tiles are the unit of control.
export async function fetchScenes(config: BridgeConfig): Promise<HueScene[]> {
  const scenes = await bridgeFetch<HueSceneResource[]>(config, "/clip/v2/resource/scene");
  return scenes
    .filter((s) => s.group?.rtype === "room")
    .map((s) => ({ id: s.id, name: s.metadata.name, roomId: s.group.rid }));
}

export async function recallScene(config: BridgeConfig, sceneId: string): Promise<void> {
  await bridgeFetch(config, `/clip/v2/resource/scene/${sceneId}`, {
    method: "PUT",
    body: JSON.stringify({ recall: { action: "active" } }),
  });
}

// The home screen's long-press quick action on the Hue tile - a "kill
// switch" for the whole house without navigating into the panel first.
export async function turnAllRoomsOff(config: BridgeConfig): Promise<void> {
  const rooms = await fetchRoomStates(config);
  await Promise.allSettled(
    rooms
      .filter((r): r is HueRoomState & { groupedLightId: string } => r.groupedLightId !== null)
      .map((r) => setGroupedLightState(config, r.groupedLightId, { on: false }))
  );
}
