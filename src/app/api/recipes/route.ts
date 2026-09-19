import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { createServiceRoleClient } from "@/lib/supabase/server";
import type { Ingredient } from "@/lib/recipes/types";

export async function POST(request: NextRequest) {
  const expectedPasscode = process.env.RECIPE_UPLOAD_PASSCODE;
  if (!expectedPasscode) {
    return NextResponse.json(
      { error: "Recipe uploads aren't configured on this deployment." },
      { status: 500 }
    );
  }

  const form = await request.formData();
  const passcode = form.get("passcode");
  if (passcode !== expectedPasscode) {
    return NextResponse.json({ error: "Wrong passcode." }, { status: 401 });
  }

  const title = String(form.get("title") ?? "").trim();
  if (!title) {
    return NextResponse.json({ error: "A title is required." }, { status: 400 });
  }

  let ingredients: Ingredient[] = [];
  let method: string[] = [];
  let tags: string[] = [];
  try {
    ingredients = JSON.parse(String(form.get("ingredients") ?? "[]"));
    method = JSON.parse(String(form.get("method") ?? "[]"));
    tags = JSON.parse(String(form.get("tags") ?? "[]"));
  } catch {
    return NextResponse.json({ error: "Malformed ingredients, method or tags." }, { status: 400 });
  }

  const servings = parseInt(String(form.get("servings") ?? "4"), 10) || 4;
  const photo = form.get("photo");

  const supabase = createServiceRoleClient();

  let photoPath: string | null = null;
  if (photo instanceof File) {
    photoPath = `${randomUUID()}.jpg`;
    const { error: uploadError } = await supabase.storage
      .from("recipe-photos")
      .upload(photoPath, photo, { contentType: "image/jpeg" });
    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }
  }

  const { data, error } = await supabase
    .from("recipes")
    .insert({
      title,
      tags,
      servings,
      yield: nullableString(form.get("yield")),
      prep_time: nullableString(form.get("prep_time")),
      rise_time: nullableString(form.get("rise_time")),
      cook_time: nullableString(form.get("cook_time")),
      oven_temp: nullableString(form.get("oven_temp")),
      ingredients,
      method,
      note: nullableString(form.get("note")),
      photo_path: photoPath,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}

function nullableString(value: FormDataEntryValue | null): string | null {
  const str = String(value ?? "").trim();
  return str.length > 0 ? str : null;
}
