"use client";

import Image from "next/image";
import { useState } from "react";
import { Minus, Plus, StickyNote } from "lucide-react";
import type { Recipe } from "@/lib/recipes/types";
import { recipePhotoUrl } from "@/lib/supabase/client";
import { scaleIngredients } from "@/lib/recipes/scale";
import { IconButton } from "@/components/ui/IconButton";

const STATS: { key: keyof Recipe; label: string }[] = [
  { key: "yield", label: "Yield" },
  { key: "prep_time", label: "Prep" },
  { key: "rise_time", label: "Rise" },
  { key: "cook_time", label: "Cook" },
  { key: "oven_temp", label: "Oven" },
];

export function RecipeDetail({ recipe }: { recipe: Recipe }) {
  const [servings, setServings] = useState(recipe.servings);
  const scaledIngredients = scaleIngredients(recipe.ingredients, recipe.servings, servings);

  return (
    <article className="mx-auto max-w-4xl">
      {recipe.photo_path && (
        <div className="relative mb-6 aspect-[16/9] w-full overflow-hidden rounded-2xl">
          <Image
            src={recipePhotoUrl(recipe.photo_path)}
            alt={recipe.title}
            fill
            unoptimized
            className="object-cover"
          />
        </div>
      )}

      <h1 className="text-3xl font-semibold">{recipe.title}</h1>

      {recipe.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {recipe.tags.map((tag) => (
            <span key={tag} className="rounded-full border border-[var(--border)] px-3 py-1 text-xs text-[var(--text-secondary)]">
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="mt-6 grid grid-cols-2 gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:grid-cols-5">
        {STATS.filter((stat) => recipe[stat.key]).map((stat) => (
          <div key={stat.key} className="text-center">
            <p className="text-xs uppercase tracking-wide text-[var(--text-tertiary)]">{stat.label}</p>
            <p className="mt-1 text-sm">{recipe[stat.key] as string}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 grid gap-10 sm:grid-cols-[1fr_1.5fr]">
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-medium">Ingredients</h2>
            <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
              <IconButton size="sm" onClick={() => setServings((s) => Math.max(1, s - 1))} aria-label="Fewer servings">
                <Minus size={14} />
              </IconButton>
              <span className="tabular-nums">{servings} servings</span>
              <IconButton size="sm" onClick={() => setServings((s) => s + 1)} aria-label="More servings">
                <Plus size={14} />
              </IconButton>
            </div>
          </div>
          <ul className="space-y-2 text-[var(--foreground)]">
            {scaledIngredients.map((ing, i) => (
              <li key={i} className="flex justify-between gap-3 border-b border-[var(--border)] pb-2 text-sm">
                <span>{ing.item}</span>
                <span className="text-[var(--text-secondary)]">
                  {ing.amount} {ing.unit}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="mb-3 text-lg font-medium">Method</h2>
          <ol className="space-y-3">
            {recipe.method.map((step, i) => (
              <li key={i} className="flex gap-3 text-sm text-[var(--foreground)]">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--surface-hover)] text-xs text-[var(--text-secondary)]">
                  {i + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {recipe.note && (
        <div className="mt-8 flex gap-3 rounded-xl border border-amber-300/30 bg-amber-300/10 p-4 text-sm text-amber-100">
          <StickyNote size={16} className="mt-0.5 shrink-0" />
          <p>{recipe.note}</p>
        </div>
      )}
    </article>
  );
}
