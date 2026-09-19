import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { createServiceRoleClient } from "@/lib/supabase/server";

const BUCKET = "screensaver-photos";

function checkPasscode(provided: unknown): NextResponse | null {
  const expected = process.env.RECIPE_UPLOAD_PASSCODE;
  if (!expected) {
    return NextResponse.json({ error: "Uploads aren't configured on this deployment." }, { status: 500 });
  }
  if (provided !== expected) {
    return NextResponse.json({ error: "Wrong passcode." }, { status: 401 });
  }
  return null;
}

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const passcodeError = checkPasscode(form.get("passcode"));
  if (passcodeError) return passcodeError;

  const photo = form.get("photo");
  if (!(photo instanceof File)) {
    return NextResponse.json({ error: "No photo provided." }, { status: 400 });
  }

  const supabase = createServiceRoleClient();
  const path = `${randomUUID()}.jpg`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, photo, { contentType: "image/jpeg" });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ path }, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const body = await request.json();
  const passcodeError = checkPasscode(body.passcode);
  if (passcodeError) return passcodeError;

  if (typeof body.path !== "string") {
    return NextResponse.json({ error: "No path provided." }, { status: 400 });
  }

  const supabase = createServiceRoleClient();
  const { error } = await supabase.storage.from(BUCKET).remove([body.path]);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
