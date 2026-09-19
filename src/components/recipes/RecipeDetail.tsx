"use client";

import Image from "next/image";
import { useState } from "react";
import { Check, Minus, Plus, ShoppingCart, StickyNote } from "lucide-react";
import type { Recipe } from "@/lib/recipes/types";
import { recipePhotoUrl } from "@/lib/supabase/client";
import { scaleIngredients } from "@/lib/recipes/scale";
import { addRecipeIngredientsToShoppingList } from "@/lib/shopping/queries";
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
  const [addedToList, setAddedToList] = useState(false);
  const scaledIngredients = scaleIngredients(recipe.ingredients, recipe.servings, servings);

  async function handleAddToShoppingList() {
    await addRecipeIngredientsToShoppingList(scaledIngredients, recipe.id);
    setAddedToList(true);
    setTimeout(() => setAddedToList(false), 2000);
  }

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

      <h1 className="font-display text-3xl font-semibold">{recipe.title}</h1>

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

          <button
            type="button"
            onClick={handleAddToShoppingList}
            disabled={addedToList}
            className="mb-4 flex w-full items-center justify-center gap-2 rounded-lg border border-[var(--border)] py-2 text-sm text-[var(--text-secondary)] transition hover:border-[var(--border-strong)] hover:bg-[var(--surface-hover)] disabled:opacity-60"
          >
            {addedToList ? (
              <>
                <Check size={14} className="text-[var(--accent-recipes)]" />
                Added
              </>
            ) : (
              <>
                <ShoppingCart size={14} />
                Add to shopping list
              </>
            )}
          </button>
          <ul className="space-y-1">
            {scaledIngredients.map((ing, i) => {
              const checked = checkedIngredients.has(i);
              return (
                <li key={i}>
                  <button
                    type="button"
                    onClick={() => toggleIngredient(i)}
                    className="flex w-full items-center gap-3 rounded-lg border-b border-[var(--border)] py-2 text-left text-sm transition hover:bg-[var(--surface-hover)]"
                  >
                    <span
                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition"
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
