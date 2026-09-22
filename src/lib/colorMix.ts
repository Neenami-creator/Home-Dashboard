// A tiny `color-mix(in srgb, ...)` substitute for browsers that don't
// support it (Safari < 16.2 - notably this dashboard's target iPad mini 2
// on iOS 12.5.7). Only handles the two shapes this app actually uses:
// mixing an accent with transparent (a glow), and mixing two opaque
// tokens (e.g. an accent with --border-strong). Resolves `var(--token)`
// references against a small static table mirroring globals.css, since
// these run before paint and can't rely on getComputedStyle being ready.
const TOKEN_COLORS: Record<string, string> = {
  "--accent-hue": "#f5c94a",
  "--accent-spotify": "#2fe272",
  "--accent-weather": "#57b2ff",
  "--accent-recipes": "#ff9166",
  "--border": "rgba(255, 255, 255, 0.065)",
  "--border-strong": "rgba(255, 255, 255, 0.11)",
};

type Rgba = { r: number; g: number; b: number; a: number };

function resolveToken(input: string): string {
  const match = input.trim().match(/^var\((--[a-zA-Z0-9-]+)\)$/);
  if (!match) return input;
  return TOKEN_COLORS[match[1]] ?? input;
}

function parseColor(input: string): Rgba {
  const value = resolveToken(input);

  if (value === "transparent") return { r: 0, g: 0, b: 0, a: 0 };

  const hexMatch = value.match(/^#([0-9a-fA-F]{6})$/);
  if (hexMatch) {
    const n = parseInt(hexMatch[1], 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255, a: 1 };
  }

  const rgbaMatch = value.match(/^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,\s/]+([\d.]+))?\s*\)$/);
  if (rgbaMatch) {
    return {
      r: Number(rgbaMatch[1]),
      g: Number(rgbaMatch[2]),
      b: Number(rgbaMatch[3]),
      a: rgbaMatch[4] !== undefined ? Number(rgbaMatch[4]) : 1,
    };
  }

  // Unrecognised input - fall back to fully transparent rather than throwing.
  return { r: 0, g: 0, b: 0, a: 0 };
}

/** Equivalent to `color-mix(in srgb, ${color} ${percent}%, transparent)`. */
export function mixWithTransparent(color: string, percent: number): string {
  const c = parseColor(color);
  const t = percent / 100;
  return `rgba(${Math.round(c.r)}, ${Math.round(c.g)}, ${Math.round(c.b)}, ${c.a * t})`;
}

/** Equivalent to `color-mix(in srgb, ${colorA} ${percentA}%, ${colorB})`. */
export function mixColors(colorA: string, percentA: number, colorB: string): string {
  const a = parseColor(colorA);
  const b = parseColor(colorB);
  const t = percentA / 100;
  const r = Math.round(a.r * t + b.r * (1 - t));
  const g = Math.round(a.g * t + b.g * (1 - t));
  const bl = Math.round(a.b * t + b.b * (1 - t));
  const alpha = a.a * t + b.a * (1 - t);
  return `rgba(${r}, ${g}, ${bl}, ${alpha})`;
}
