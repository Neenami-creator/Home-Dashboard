"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check, Plus, Trash2 } from "lucide-react";
import { PanelShell } from "@/components/PanelShell";
import {
  fetchShoppingList,
  toggleShoppingItem,
  removeShoppingItem,
  clearCheckedItems,
  addManualItem,
} from "@/lib/shopping/queries";
import type { ShoppingItem } from "@/lib/shopping/types";

const ACCENT = "var(--accent-recipes)";

export default function ShoppingListPage() {
  const [items, setItems] = useState<ShoppingItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [newItem, setNewItem] = useState("");

  function refresh() {
    fetchShoppingList()
      .then(setItems)
      .catch((err) => setError(err instanceof Error ? err.message : "Couldn't load the shopping list."));
  }

  useEffect(refresh, []);

  async function handleToggle(item: ShoppingItem) {
    setItems((prev) => prev?.map((i) => (i.id === item.id ? { ...i, checked: !i.checked } : i)) ?? prev);
    try {
      await toggleShoppingItem(item.id, !item.checked);
    } catch {
      refresh();
    }
  }

  async function handleRemove(id: string) {
    setItems((prev) => prev?.filter((i) => i.id !== id) ?? prev);
    try {
      await removeShoppingItem(id);
    } catch {
      refresh();
    }
  }

  async function handleClearChecked() {
    setItems((prev) => prev?.filter((i) => !i.checked) ?? prev);
    try {
      await clearCheckedItems();
    } catch {
      refresh();
    }
  }

  async function handleAddManual(e: React.FormEvent) {
    e.preventDefault();
    if (!newItem.trim()) return;
    const label = newItem.trim();
    setNewItem("");
    try {
      await addManualItem(label, "", "");
      refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't add that item.");
    }
  }

  const hasChecked = items?.some((i) => i.checked) ?? false;

  return (
    <PanelShell title="Shopping List" accent={ACCENT}>
      <div className="mx-auto max-w-lg">
        <form onSubmit={handleAddManual} className="mb-6 flex gap-2">
          <input
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            placeholder="Add an item…"
            className="flex-1 rounded-full border border-[var(--border)] bg-black/30 px-4 py-2 text-sm text-[var(--foreground)]"
          />
          <button
            type="submit"
            aria-label="Add item"
            className="flex h-10 w-10 items-center justify-center rounded-full text-black"
            style={{ backgroundColor: ACCENT }}
          >
            <Plus size={18} />
          </button>
        </form>

        {error && (
          <div className="mb-4 rounded-xl border border-red-400/30 bg-red-400/10 p-4 text-center text-sm text-red-300">
            {error}
          </div>
        )}

        {!items && !error && <p className="text-center text-[var(--text-secondary)]">Loading…</p>}
        {items?.length === 0 && (
          <p className="text-center text-[var(--text-secondary)]">
            Nothing on the list. Add items here, or from a recipe.
          </p>
        )}

        <ul className="space-y-2">
          <AnimatePresence initial={false}>
            {items?.map((item) => (
              <motion.li
                key={item.id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3">
                  <button
                    type="button"
                    onClick={() => handleToggle(item)}
                    aria-label={item.checked ? `Uncheck ${item.item}` : `Check ${item.item}`}
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition"
                    style={{
                      borderColor: item.checked ? ACCENT : "var(--border-strong)",
                      backgroundColor: item.checked ? ACCENT : "transparent",
                    }}
                  >
                    {item.checked && <Check size={14} className="text-black" />}
                  </button>
                  <span
                    className={`flex-1 text-sm ${item.checked ? "text-[var(--text-tertiary)] line-through" : "text-[var(--foreground)]"}`}
                  >
                    {item.item}
                  </span>
                  {(item.amount || item.unit) && (
                    <span
                      className={`text-sm ${item.checked ? "text-[var(--text-tertiary)] line-through" : "text-[var(--text-secondary)]"}`}
                    >
                      {item.amount} {item.unit}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemove(item.id)}
                    aria-label={`Delete ${item.item}`}
                    className="text-[var(--text-tertiary)] hover:text-red-400"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>

        {hasChecked && (
          <button
            type="button"
            onClick={handleClearChecked}
            className="mx-auto mt-6 block text-xs text-[var(--text-tertiary)] underline underline-offset-2"
          >
            Clear checked items
          </button>
        )}
      </div>
    </PanelShell>
  );
}
