import { ChefHat, CloudSun, Lightbulb, Music2, type LucideIcon } from "lucide-react";

export type PanelDef = {
  href: string;
  name: string;
  description: string;
  accent: string;
  icon: LucideIcon;
};

export const PANELS: PanelDef[] = [
  {
    href: "/hue",
    name: "Hue Lights",
    description: "Room-by-room light control",
    accent: "var(--accent-hue)",
    icon: Lightbulb,
  },
  {
    href: "/spotify",
    name: "Spotify",
    description: "Sonos playback control",
    accent: "var(--accent-spotify)",
    icon: Music2,
  },
  {
    href: "/weather",
    name: "Weather",
    description: "BOM current conditions & forecast",
    accent: "var(--accent-weather)",
    icon: CloudSun,
  },
  {
    href: "/recipes",
    name: "Recipes",
    description: "The recipe library",
    accent: "var(--accent-recipes)",
    icon: ChefHat,
  },
];
