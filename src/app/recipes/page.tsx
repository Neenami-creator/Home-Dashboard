"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ShoppingCart } from "lucide-react";
import { PanelShell } from "@/components/PanelShell";
import { RecipeGridCard } from "@/components/recipes/RecipeGridCard";
import { fetchRecipes, searchRecipes } from "@/lib/recipes/queries";
import type { Recipe } from "@/lib/recipes/types";

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetchRecipes()
      .then(setRecipes)
      .catch((err) => setError(err instanceof Error ? err.message : "Couldn't load recipes."));
  }, []);

  const visible = recipes ? searchRecipes(recipes, query) : [];

  return (
    <PanelShell title="Recipes" accent="var(--accent-recipes)">
      <div className="mb-6 flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by title, tag or ingredient…"
          className="w-full max-w-sm rounded-full border border-[var(--border)] bg-black/30 px-4 py-2 text-white sm:w-80"
        />
        <div className="flex gap-2">
          <Link
            href="/shopping"
            className="flex items-center gap-1.5 rounded-full border border-[var(--border)] px-4 py-2 text-sm text-[var(--text-secondary)] transition hover:bg-[var(--surface-hover)]"
          >
            <ShoppingCart size={14} />
            Shopping list
          </Link>
          <Link
            href="/recipes/upload"
            className="rounded-full border border-[var(--border)] px-4 py-2 text-sm text-[var(--text-secondary)] transition hover:bg-[var(--surface-hover)]"
          >
            + Add recipe
          </Link>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-400/30 bg-red-400/10 p-4 text-center text-sm text-red-300">
          {error}
        </div>
      )}

      {!recipes && !error && <p className="text-center text-[var(--text-secondary)]">Loading recipes…</p>}

      {recipes && visible.length === 0 && (
        <p className="text-center text-[var(--text-secondary)]">
          {recipes.length === 0 ? "No recipes yet." : "Nothing matches that search."}
        </p>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {visible.map((recipe) => (
          <RecipeGridCard key={recipe.id} recipe={recipe} />
        ))}
      </div>
    </PanelShell>
  );
}
