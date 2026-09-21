"use client";

import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { PanelShell } from "@/components/PanelShell";
import { RecipeGridCard } from "@/components/recipes/RecipeGridCard";
import { RecipeCardSkeleton } from "@/components/recipes/RecipeCardSkeleton";
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
      <div className="mb-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
        <div className="relative w-full sm:w-[380px]">
          <Search
            size={16}
            strokeWidth={1.7}
            className="pointer-events-none absolute left-[18px] top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, tag or ingredient…"
            className="recipes-input w-full pl-[46px] text-[var(--foreground)]"
          />
        </div>
        <Link
          href="/recipes/upload"
          className="flex h-[52px] items-center gap-2 rounded-[13px] border border-[var(--border)] bg-[var(--surface-2)] px-5 text-[14px] font-medium text-[var(--text-secondary)] shadow-[inset_0_1px_0_var(--inset-highlight)] transition-colors hover:border-[var(--border-strong)] hover:text-[var(--accent-recipes)]"
        >
          <Plus size={16} strokeWidth={1.8} />
          Add recipe
        </Link>
      </div>

      {error && (
        <div className="mb-6 flex items-center justify-center gap-2 rounded-[12px] border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 text-center text-[14px] text-[var(--text-secondary)]">
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-red-400" />
          {error}
        </div>
      )}

      {!recipes && !error && (
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <RecipeCardSkeleton key={i} />
          ))}
        </div>
      )}

      {recipes && visible.length === 0 && (
        <p className="text-center text-[var(--text-secondary)]">
          {recipes.length === 0 ? "No recipes yet." : "Nothing matches that search."}
        </p>
      )}

      <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
        {visible.map((recipe) => (
          <RecipeGridCard key={recipe.id} recipe={recipe} />
        ))}
      </div>
    </PanelShell>
  );
}
