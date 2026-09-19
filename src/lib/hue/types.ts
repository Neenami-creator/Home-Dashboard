export type BridgeConfig = {
  ip: string;
  appKey: string;
};

export type HueColorPreset = {
  name: string;
  swatch: string; // CSS color for the UI swatch
  xy: [number, number];
};

// Minimal shapes for the fields the dashboard actually reads/writes.
// See the CLIP v2 API docs served by the bridge itself for the full schema.

export type HueRoom = {
  id: string;
  metadata: { name: string };
  children: { rid: string; rtype: string }[];
  services: { rid: string; rtype: string }[];
};

export type HueGroupedLight = {
  id: string;
  on: { on: boolean };
  dimming?: { brightness: number };
};

export type HueRoomState = {
  id: string; // room id
  name: string;
  groupedLightId: string | null;
  on: boolean;
  brightness: number; // 0-100
};
