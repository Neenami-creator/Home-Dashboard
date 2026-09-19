"use client";

import { use, useEffect, useState } from "react";
import { PanelShell } from "@/components/PanelShell";
import { RecipeDetail } from "@/components/recipes/RecipeDetail";
import { fetchRecipeById } from "@/lib/recipes/queries";
import type { Recipe } from "@/lib/recipes/types";

export default function RecipePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [recipe, setRecipe] = useState<Recipe | null | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRecipeById(id)
      .then(setRecipe)
      .catch((err) => setError(err instanceof Error ? err.message : "Couldn't load this recipe."));
  }, [id]);

  return (
    <PanelShell title="Recipes" accent="#ff8a5c">
      {error && (
        <div className="mb-6 rounded-xl border border-red-400/30 bg-red-400/10 p-4 text-center text-sm text-red-300">
          {error}
        </div>
      )}
      {recipe === undefined && !error && <p className="text-center text-white/50">Loading…</p>}
      {recipe === null && <p className="text-center text-white/50">Recipe not found.</p>}
      {recipe && <RecipeDetail recipe={recipe} />}
    </PanelShell>
  );
}
