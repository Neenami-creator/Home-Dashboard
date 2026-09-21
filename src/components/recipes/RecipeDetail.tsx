"use client";

import Image from "next/image";
import { useState } from "react";
import { Check, Minus, Plus, StickyNote } from "lucide-react";
import type { Recipe } from "@/lib/recipes/types";
import { recipePhotoUrl } from "@/lib/supabase/client";
import { scaleIngredients } from "@/lib/recipes/scale";
import { IconButton } from "@/components/ui/IconButton";
import { useWakeLock } from "@/lib/useWakeLock";

const STATS: { key: keyof Recipe; label: string }[] = [
  { key: "yield", label: "Yield" },
  { key: "prep_time", label: "Prep" },
  { key: "rise_time", label: "Rise" },
  { key: "cook_time", label: "Cook" },
  { key: "oven_temp", label: "Oven" },
];

export function RecipeDetail({ recipe }: { recipe: Recipe }) {
  const [servings, setServings] = useState(recipe.servings);
  const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(new Set());
  const scaledIngredients = scaleIngredients(recipe.ingredients, recipe.servings, servings);

  // A recipe is usually open because someone's mid-cook with messy hands -
  // keep the screen from dimming out from under them.
  useWakeLock(true);

  function toggleIngredient(index: number) {
    setCheckedIngredients((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  return (
    <article className="mx-auto max-w-4xl">
      {recipe.photo_path && (
        <div className="relative mb-6 aspect-[16/9] w-full overflow-hidden rounded-[14px]">
          <Image
            src={recipePhotoUrl(recipe.photo_path)}
            alt={recipe.title}
            fill
            unoptimized
            className="object-cover"
          />
        </div>
      )}

      <h1 className="font-display text-[32px] font-normal leading-tight">{recipe.title}</h1>

      {recipe.tags.length > 0 && (
        <p className="mt-2 text-[14px] text-[var(--text-secondary)]">{recipe.tags.join(" · ")}</p>
      )}

      <div className="control-surface mt-6 grid grid-cols-2 gap-4 p-5 sm:grid-cols-5">
        {STATS.filter((stat) => recipe[stat.key]).map((stat) => (
          <div key={stat.key} className="text-center">
            <p className="instrument-label">{stat.label}</p>
            <p className="font-display mt-1 text-[17px]">{recipe[stat.key] as string}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 grid gap-10 sm:grid-cols-[1fr_1.5fr]">
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-[19px] font-normal">Ingredients</h2>
            <div className="flex items-center gap-2 text-[14px] text-[var(--text-secondary)]">
              <IconButton size="sm" onClick={() => setServings((s) => Math.max(1, s - 1))} aria-label="Fewer servings">
                <Minus size={14} strokeWidth={1.8} />
              </IconButton>
              <span className="tabular-nums">{servings} servings</span>
              <IconButton size="sm" onClick={() => setServings((s) => s + 1)} aria-label="More servings">
                <Plus size={14} strokeWidth={1.8} />
              </IconButton>
            </div>
          </div>
          <ul className="space-y-1">
            {scaledIngredients.map((ing, i) => {
              const checked = checkedIngredients.has(i);
              return (
                <li key={i}>
                  <button
                    type="button"
                    onClick={() => toggleIngredient(i)}
                    className="flex w-full items-center gap-3 rounded-[10px] border-b border-[var(--border)] py-2 text-left text-[15px] transition-colors hover:bg-[var(--surface-2)]"
                  >
                    <span
                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors"
                      style={{
                        borderColor: checked ? "var(--accent-recipes)" : "var(--border-strong)",
                        backgroundColor: checked ? "var(--accent-recipes)" : "transparent",
                      }}
                    >
                      {checked && <Check size={12} className="text-black" />}
                    </span>
                    <span
                      className={`flex-1 ${checked ? "text-[var(--text-tertiary)] line-through" : "text-[var(--foreground)]"}`}
                    >
                      {ing.item}
                    </span>
                    <span
                      className={checked ? "text-[var(--text-tertiary)] line-through" : "text-[var(--text-secondary)]"}
                    >
                      {ing.amount} {ing.unit}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <div>
          <h2 className="font-display mb-3 text-[19px] font-normal">Method</h2>
          <ol className="space-y-3">
            {recipe.method.map((step, i) => (
              <li key={i} className="flex gap-3 text-[15px] text-[var(--foreground)]">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface-2)] text-[12px] text-[var(--text-secondary)]">
                  {i + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {recipe.note && (
        <div className="control-surface mt-8 flex gap-3 p-4 text-[14px] text-[var(--text-secondary)]">
          <StickyNote size={16} strokeWidth={1.7} className="mt-0.5 shrink-0 text-[var(--accent-recipes)]" />
          <p>{recipe.note}</p>
        </div>
      )}
    </article>
  );
}
