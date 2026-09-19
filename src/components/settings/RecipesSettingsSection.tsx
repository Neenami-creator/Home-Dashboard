"use client";

import { ChefHat } from "lucide-react";
import { Card } from "@/components/ui/Card";

const PLACEHOLDER_URL = "https://placeholder.supabase.co";

export function RecipesSettingsSection() {
  const configured = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? PLACEHOLDER_URL) !== PLACEHOLDER_URL;

  return (
    <section>
      <h2 className="mb-3 flex items-center gap-2 text-lg font-medium">
        <ChefHat size={18} className="text-[var(--accent-recipes)]" />
        Recipes
      </h2>
      <Card className="p-5">
        <p className="text-sm">{configured ? "Connected to Supabase" : "Not configured"}</p>
        <p className="mt-1 text-xs text-[var(--text-tertiary)]">
          {configured
            ? "Managed via environment variables, not this screen."
            : "Set NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY and RECIPE_UPLOAD_PASSCODE - see the README."}
        </p>
      </Card>
    </section>
  );
}
