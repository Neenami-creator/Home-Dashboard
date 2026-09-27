export type AmbientTheme = {
  glow1: string;
  glow2: string;
  glow3: string;
};

// Four broad periods rather than a continuous gradient - the ambient glow
// only needs to feel "of the day," not track sunrise/sunset precisely, and
// four fixed palettes are trivial to reason about and tune.
const DAWN: AmbientTheme = {
  glow1: "rgba(185, 154, 98, 0.05)",
  glow2: "rgba(185, 154, 98, 0.035)",
  glow3: "rgba(130, 155, 173, 0.02)",
};

const DAY: AmbientTheme = {
  glow1: "rgba(130, 155, 173, 0.025)",
  glow2: "rgba(130, 155, 173, 0.02)",
  glow3: "rgba(147, 170, 149, 0.015)",
};

const EVENING: AmbientTheme = {
  glow1: "rgba(185, 154, 98, 0.055)",
  glow2: "rgba(185, 154, 98, 0.04)",
  glow3: "rgba(130, 155, 173, 0.02)",
};

const NIGHT: AmbientTheme = {
  glow1: "rgba(90, 95, 110, 0.03)",
  glow2: "rgba(90, 95, 110, 0.022)",
  glow3: "rgba(147, 170, 149, 0.01)",
};

export function ambientThemeForHour(hour: number): AmbientTheme {
  if (hour >= 5 && hour < 8) return DAWN;
  if (hour >= 8 && hour < 17) return DAY;
  if (hour >= 17 && hour < 21) return EVENING;
  return NIGHT;
}
