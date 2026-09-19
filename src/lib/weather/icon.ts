import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudSun,
  Sun,
  Wind,
  type LucideIcon,
} from "lucide-react";

// Maps BOM's free-text condition/precis strings to a representative icon.
// Best-effort keyword matching rather than an exhaustive code list, since
// BOM doesn't publish a stable icon/condition enum in this JSON.
export function weatherIcon(text: string | null): LucideIcon {
  const t = (text ?? "").toLowerCase();
  if (t.includes("storm") || t.includes("thunder")) return CloudLightning;
  if (t.includes("snow")) return CloudSnow;
  if (t.includes("shower") || t.includes("drizzle")) return CloudDrizzle;
  if (t.includes("rain")) return CloudRain;
  if (t.includes("fog") || t.includes("mist") || t.includes("haze")) return CloudFog;
  if (t.includes("windy") || t.includes("gale")) return Wind;
  if (t.includes("cloud") || t.includes("overcast")) return Cloud;
  if (t.includes("sunny") || t.includes("clear") || t.includes("fine")) return Sun;
  return CloudSun;
}
