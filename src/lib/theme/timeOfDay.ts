export type AmbientTheme = {
  glow1: string;
  glow2: string;
  glow3: string;
};

// Four broad periods rather than a continuous gradient - the ambient glow
// only needs to feel "of the day," not track sunrise/sunset precisely, and
// four fixed palettes are trivial to reason about and tune.
const DAWN: AmbientTheme = {
  glow1: "rgba(198, 158, 103, 0.05)",
  glow2: "rgba(198, 158, 103, 0.035)",
  glow3: "rgba(87, 178, 255, 0.02)",
};

const DAY: AmbientTheme = {
  glow1: "rgba(125, 160, 174, 0.03)",
  glow2: "rgba(125, 160, 174, 0.025)",
  glow3: "rgba(47, 226, 114, 0.02)",
};

const EVENING: AmbientTheme = {
  glow1: "rgba(174, 112, 65, 0.055)",
  glow2: "rgba(174, 112, 65, 0.04)",
  glow3: "rgba(87, 178, 255, 0.02)",
};

const NIGHT: AmbientTheme = {
  glow1: "rgba(76, 85, 130, 0.035)",
  glow2: "rgba(76, 85, 130, 0.025)",
  glow3: "rgba(47, 226, 114, 0.012)",
};

export function ambientThemeForHour(hour: number): AmbientTheme {
  if (hour >= 5 && hour < 8) return DAWN;
  if (hour >= 8 && hour < 17) return DAY;
  if (hour >= 17 && hour < 21) return EVENING;
  return NIGHT;
}
