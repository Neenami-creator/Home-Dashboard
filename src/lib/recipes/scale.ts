import type { Ingredient } from "./types";

// Ingredient amounts are free text ("500", "1 1/2", "a pinch") since not
// every ingredient scales sensibly. Only the ones that parse as a plain
// number or simple fraction are scaled; anything else is shown unchanged.
export function scaleAmount(amount: string, ratio: number): string {
  const trimmed = amount.trim();
  if (!trimmed) return amount;

  const fractionMatch = trimmed.match(/^(\d+)?\s*(\d+)\/(\d+)$/);
  if (fractionMatch) {
    const whole = fractionMatch[1] ? parseInt(fractionMatch[1], 10) : 0;
    const numerator = parseInt(fractionMatch[2], 10);
    const denominator = parseInt(fractionMatch[3], 10);
    const value = whole + numerator / denominator;
    return formatNumber(value * ratio);
  }

  const numberMatch = trimmed.match(/^\d+(\.\d+)?$/);
  if (numberMatch) {
    return formatNumber(parseFloat(trimmed) * ratio);
  }

  return amount;
}

function formatNumber(value: number): string {
  const rounded = Math.round(value * 100) / 100;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
}

export function scaleIngredients(ingredients: Ingredient[], fromServings: number, toServings: number): Ingredient[] {
  if (fromServings <= 0) return ingredients;
  const ratio = toServings / fromServings;
  return ingredients.map((ing) => ({ ...ing, amount: scaleAmount(ing.amount, ratio) }));
}
