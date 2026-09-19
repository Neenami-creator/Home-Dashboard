export type Ingredient = {
  item: string;
  amount: string;
  unit: string;
};

export type Recipe = {
  id: string;
  title: string;
  tags: string[];
  servings: number;
  yield: string | null;
  prep_time: string | null;
  rise_time: string | null;
  cook_time: string | null;
  oven_temp: string | null;
  ingredients: Ingredient[];
  method: string[];
  note: string | null;
  photo_path: string | null;
  created_at: string;
};

export type NewRecipe = Omit<Recipe, "id" | "created_at">;
