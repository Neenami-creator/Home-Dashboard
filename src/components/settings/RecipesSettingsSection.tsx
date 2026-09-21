"use client";

import type { CSSProperties } from "react";
import { ChefHat } from "lucide-react";

const PLACEHOLDER_URL = "https://placeholder.supabase.co";

export function RecipesSettingsSection() {
  const configured = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? PLACEHOLDER_URL) !== PLACEHOLDER_URL;

  return (
    <section>
      <h2 className="mb-3 flex items-center gap-2">
        <ChefHat size={16} strokeWidth={1.7} className="text-[var(--accent-recipes)]" />
        <span className="instrument-label">Recipes</span>
      </h2>
      <div
        className="control-surface p-5"
        style={{ "--accent": "var(--accent-recipes)" } as CSSProperties}
        data-active={configured}
      >
        <p className="text-[15px]">{configured ? "Connected to Supabase" : "Not configured"}</p>
        <p className="mt-1 text-[12px] text-[var(--text-tertiary)]">
          {configured
            ? "Managed via environment variables, not this screen."
            : "Set NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY and RECIPE_UPLOAD_PASSCODE - see the README."}
        </p>
      </div>
    </section>
  );
}
