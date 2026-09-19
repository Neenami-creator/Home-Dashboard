"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { PanelShell } from "@/components/PanelShell";
import { compressImage } from "@/lib/recipes/compressImage";
import type { Ingredient } from "@/lib/recipes/types";

const PASSCODE_STORAGE_KEY = "recipe-upload-passcode";

function emptyIngredient(): Ingredient {
  return { item: "", amount: "", unit: "" };
}

export default function UploadRecipePage() {
  const router = useRouter();

  const [passcode, setPasscode] = useState(
    typeof window !== "undefined" ? window.sessionStorage.getItem(PASSCODE_STORAGE_KEY) ?? "" : ""
  );
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState("");
  const [servings, setServings] = useState(4);
  const [yieldText, setYieldText] = useState("");
  const [prepTime, setPrepTime] = useState("");
  const [riseTime, setRiseTime] = useState("");
  const [cookTime, setCookTime] = useState("");
  const [ovenTemp, setOvenTemp] = useState("");
  const [ingredients, setIngredients] = useState<Ingredient[]>([emptyIngredient()]);
  const [method, setMethod] = useState<string[]>([""]);
  const [note, setNote] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateIngredient(index: number, patch: Partial<Ingredient>) {
    setIngredients((prev) => prev.map((ing, i) => (i === index ? { ...ing, ...patch } : ing)));
  }

  function updateStep(index: number, value: string) {
    setMethod((prev) => prev.map((step, i) => (i === index ? value : step)));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const form = new FormData();
      form.set("passcode", passcode);
      form.set("title", title.trim());
      form.set(
        "tags",
        JSON.stringify(
          tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        )
      );
      form.set("servings", String(servings));
      form.set("yield", yieldText);
      form.set("prep_time", prepTime);
      form.set("rise_time", riseTime);
      form.set("cook_time", cookTime);
      form.set("oven_temp", ovenTemp);
      form.set("ingredients", JSON.stringify(ingredients.filter((i) => i.item.trim())));
      form.set("method", JSON.stringify(method.map((s) => s.trim()).filter(Boolean)));
      form.set("note", note);

      if (photo) {
        const compressed = await compressImage(photo);
        form.set("photo", compressed, "photo.jpg");
      }

      const res = await fetch("/api/recipes", { method: "POST", body: form });
      const body = await res.json();

      if (!res.ok) {
        throw new Error(body.error ?? "Couldn't save the recipe.");
      }

      window.sessionStorage.setItem(PASSCODE_STORAGE_KEY, passcode);
      router.push(`/recipes/${body.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save the recipe.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PanelShell title="Add a recipe" accent="#ff8a5c">
      <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-6">
        <label className="block text-sm text-white/70">
          Passcode
          <input
            type="password"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            required
            className="mt-1 w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-white"
          />
        </label>

        <label className="block text-sm text-white/70">
          Title
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="mt-1 w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-white"
          />
        </label>

        <label className="block text-sm text-white/70">
          Tags (comma-separated)
          <input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="baking, weeknight, vegetarian"
            className="mt-1 w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-white"
          />
        </label>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <label className="block text-sm text-white/70">
            Servings
            <input
              type="number"
              min={1}
              value={servings}
              onChange={(e) => setServings(Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-white"
            />
          </label>
          <label className="block text-sm text-white/70">
            Yield
            <input
              value={yieldText}
              onChange={(e) => setYieldText(e.target.value)}
              placeholder="1 loaf"
              className="mt-1 w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-white"
            />
          </label>
          <label className="block text-sm text-white/70">
            Oven
            <input
              value={ovenTemp}
              onChange={(e) => setOvenTemp(e.target.value)}
              placeholder="200°C"
              className="mt-1 w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-white"
            />
          </label>
          <label className="block text-sm text-white/70">
            Prep
            <input
              value={prepTime}
              onChange={(e) => setPrepTime(e.target.value)}
              placeholder="15 min"
              className="mt-1 w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-white"
            />
          </label>
          <label className="block text-sm text-white/70">
            Rise
            <input
              value={riseTime}
              onChange={(e) => setRiseTime(e.target.value)}
              placeholder="1 hour"
              className="mt-1 w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-white"
            />
          </label>
          <label className="block text-sm text-white/70">
            Cook
            <input
              value={cookTime}
              onChange={(e) => setCookTime(e.target.value)}
              placeholder="30 min"
              className="mt-1 w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-white"
            />
          </label>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm text-white/70">Ingredients</span>
            <button
              type="button"
              onClick={() => setIngredients((prev) => [...prev, emptyIngredient()])}
              className="text-xs text-white/50 underline underline-offset-2"
            >
              + Add ingredient
            </button>
          </div>
          <div className="space-y-2">
            {ingredients.map((ing, i) => (
              <div key={i} className="grid grid-cols-[2fr_1fr_1fr_auto] gap-2">
                <input
                  value={ing.item}
                  onChange={(e) => updateIngredient(i, { item: e.target.value })}
                  placeholder="Item"
                  className="rounded-lg border border-white/15 bg-black/30 px-2 py-1.5 text-sm text-white"
                />
                <input
                  value={ing.amount}
                  onChange={(e) => updateIngredient(i, { amount: e.target.value })}
                  placeholder="Amount"
                  className="rounded-lg border border-white/15 bg-black/30 px-2 py-1.5 text-sm text-white"
                />
                <input
                  value={ing.unit}
                  onChange={(e) => updateIngredient(i, { unit: e.target.value })}
                  placeholder="Unit"
                  className="rounded-lg border border-white/15 bg-black/30 px-2 py-1.5 text-sm text-white"
                />
                <button
                  type="button"
                  onClick={() => setIngredients((prev) => prev.filter((_, idx) => idx !== i))}
                  className="text-white/40"
                  aria-label="Remove ingredient"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm text-white/70">Method</span>
            <button
              type="button"
              onClick={() => setMethod((prev) => [...prev, ""])}
              className="text-xs text-white/50 underline underline-offset-2"
            >
              + Add step
            </button>
          </div>
          <div className="space-y-2">
            {method.map((step, i) => (
              <div key={i} className="flex gap-2">
                <span className="mt-2 text-xs text-white/40">{i + 1}.</span>
                <textarea
                  value={step}
                  onChange={(e) => updateStep(i, e.target.value)}
                  rows={2}
                  className="flex-1 rounded-lg border border-white/15 bg-black/30 px-2 py-1.5 text-sm text-white"
                />
                <button
                  type="button"
                  onClick={() => setMethod((prev) => prev.filter((_, idx) => idx !== i))}
                  className="text-white/40"
                  aria-label="Remove step"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        <label className="block text-sm text-white/70">
          Note
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            className="mt-1 w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-white"
          />
        </label>

        <label className="block text-sm text-white/70">
          Photo
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
            className="mt-1 block w-full text-sm text-white/70"
          />
        </label>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-[#ff8a5c] py-2 font-medium text-black disabled:opacity-50"
        >
          {submitting ? "Saving…" : "Save recipe"}
        </button>
      </form>
    </PanelShell>
  );
}
