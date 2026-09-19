import { supabase } from "@/lib/supabase/client";
import type { Recipe } from "./types";

export async function fetchRecipes(): Promise<Recipe[]> {
  const { data, error } = await supabase
    .from("recipes")
    .select("*")
    .order("title", { ascending: true });
  if (error) throw new Error(error.message);
  return data as Recipe[];
}

export async function fetchRecipeById(id: string): Promise<Recipe | null> {
  const { data, error } = await supabase.from("recipes").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  return data as Recipe | null;
}

export function searchRecipes(recipes: Recipe[], query: string): Recipe[] {
  const q = query.trim().toLowerCase();
  if (!q) return recipes;
  return recipes.filter((recipe) => {
    if (recipe.title.toLowerCase().includes(q)) return true;
    if (recipe.tags.some((tag) => tag.toLowerCase().includes(q))) return true;
    if (recipe.ingredients.some((ing) => ing.item.toLowerCase().includes(q))) return true;
    return false;
  });
}
