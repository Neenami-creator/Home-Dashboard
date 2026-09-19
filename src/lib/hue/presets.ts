import type { HueColorPreset } from "./types";

// A handful of hand-picked xy values (CIE 1931 color space, as the bridge expects)
// rather than a full color wheel — enough for "make this room warm/cool/party"
// without building a color picker in this functional-first pass.
export const HUE_COLOR_PRESETS: HueColorPreset[] = [
  { name: "Warm white", swatch: "#ffd9a0", xy: [0.4573, 0.41] },
  { name: "Daylight", swatch: "#f5f3ff", xy: [0.3227, 0.329] },
  { name: "Relax red", swatch: "#ff5a4e", xy: [0.6484, 0.3309] },
  { name: "Ocean blue", swatch: "#4ea8ff", xy: [0.167, 0.04] },
  { name: "Forest green", swatch: "#4fd67a", xy: [0.2151, 0.7106] },
  { name: "Party purple", swatch: "#b565ff", xy: [0.2649, 0.1219] },
];
