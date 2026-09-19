import { Clapperboard, CookingPot, Sparkles, UtensilsCrossed, type LucideIcon } from "lucide-react";
import type { Routine } from "./types";

export const ROUTINE_ICONS: Record<Routine["icon"], LucideIcon> = {
  dinner: UtensilsCrossed,
  cooking: CookingPot,
  movie: Clapperboard,
  custom: Sparkles,
};
