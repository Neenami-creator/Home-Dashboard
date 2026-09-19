export type AmbientTheme = {
  glow1: string;
  glow2: string;
  glow3: string;
};

// Four broad periods rather than a continuous gradient - the ambient glow
// only needs to feel "of the day," not track sunrise/sunset precisely, and
// four fixed palettes are trivial to reason about and tune.
const DAWN: AmbientTheme = {
  glow1: "rgba(255, 176, 110, 0.10)",
  glow2: "rgba(255, 138, 92, 0.06)",
  glow3: "rgba(87, 178, 255, 0.04)",
};

const DAY: AmbientTheme = {
  glow1: "rgba(245, 201, 74, 0.07)",
  glow2: "rgba(87, 178, 255, 0.06)",
  glow3: "rgba(47, 226, 114, 0.05)",
};

const EVENING: AmbientTheme = {
  glow1: "rgba(255, 145, 102, 0.11)",
  glow2: "rgba(245, 201, 74, 0.07)",
  glow3: "rgba(87, 178, 255, 0.04)",
};

const NIGHT: AmbientTheme = {
  glow1: "rgba(87, 120, 200, 0.05)",
  glow2: "rgba(47, 226, 114, 0.025)",
  glow3: "rgba(245, 201, 74, 0.02)",
};

export function ambientThemeForHour(hour: number): AmbientTheme {
  if (hour >= 5 && hour < 8) return DAWN;
  if (hour >= 8 && hour < 17) return DAY;
  if (hour >= 17 && hour < 21) return EVENING;
  return NIGHT;
}
