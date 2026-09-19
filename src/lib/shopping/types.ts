export type ShoppingItem = {
  id: string;
  item: string;
  amount: string;
  unit: string;
  checked: boolean;
  source_recipe_id: string | null;
  created_at: string;
};
