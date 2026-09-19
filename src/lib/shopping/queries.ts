import { supabase } from "@/lib/supabase/client";
import { parseAmount, formatNumber } from "@/lib/recipes/scale";
import type { Ingredient } from "@/lib/recipes/types";
import type { ShoppingItem } from "./types";

export async function fetchShoppingList(): Promise<ShoppingItem[]> {
  const { data, error } = await supabase
    .from("shopping_list_items")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return data as ShoppingItem[];
}

export async function toggleShoppingItem(id: string, checked: boolean): Promise<void> {
  const { error } = await supabase.from("shopping_list_items").update({ checked }).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function removeShoppingItem(id: string): Promise<void> {
  const { error } = await supabase.from("shopping_list_items").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function clearCheckedItems(): Promise<void> {
  const { error } = await supabase.from("shopping_list_items").delete().eq("checked", true);
  if (error) throw new Error(error.message);
}

export async function addManualItem(item: string, amount: string, unit: string): Promise<void> {
  const { error } = await supabase.from("shopping_list_items").insert({ item, amount, unit });
  if (error) throw new Error(error.message);
}

// Merges into any existing *unchecked* item with the same name and unit
// when both amounts are plain numbers (so "2 eggs" + "3 eggs" becomes one
// "5 eggs" row); anything else (mismatched units, "a pinch", different
// items) is added as its own row rather than risk merging the wrong things.
export async function addRecipeIngredientsToShoppingList(
  ingredients: Ingredient[],
  recipeId: string
): Promise<void> {
  const existing = await fetchShoppingList();
  const unchecked = existing.filter((i) => !i.checked);

  const updates: { id: string; amount: string }[] = [];
  const inserts: { item: string; amount: string; unit: string; source_recipe_id: string }[] = [];

  for (const ing of ingredients) {
    const key = (i: { item: string; unit: string }) =>
      i.item.trim().toLowerCase() === ing.item.trim().toLowerCase() &&
      i.unit.trim().toLowerCase() === ing.unit.trim().toLowerCase();

    const match = unchecked.find(key);
    const incomingAmount = parseAmount(ing.amount);
    const existingAmount = match ? parseAmount(match.amount) : null;

    if (match && incomingAmount !== null && existingAmount !== null) {
      const merged = formatNumber(existingAmount + incomingAmount);
      updates.push({ id: match.id, amount: merged });
      match.amount = merged; // keep local copy in sync for repeated ingredients within the same recipe
    } else {
      inserts.push({ item: ing.item, amount: ing.amount, unit: ing.unit, source_recipe_id: recipeId });
    }
  }

  await Promise.all([
    ...updates.map((u) => supabase.from("shopping_list_items").update({ amount: u.amount }).eq("id", u.id)),
    inserts.length > 0 ? supabase.from("shopping_list_items").insert(inserts) : Promise.resolve(),
  ]);
}
