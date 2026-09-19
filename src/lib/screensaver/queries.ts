import { supabase } from "@/lib/supabase/client";

const BUCKET = "screensaver-photos";

export async function listScreensaverPhotos(): Promise<{ path: string; url: string }[]> {
  const { data, error } = await supabase.storage.from(BUCKET).list("", {
    sortBy: { column: "created_at", order: "desc" },
  });
  if (error) throw new Error(error.message);

  return data
    .filter((f) => f.name !== ".emptyFolderPlaceholder")
    .map((f) => ({
      path: f.name,
      url: supabase.storage.from(BUCKET).getPublicUrl(f.name).data.publicUrl,
    }));
}

export async function uploadScreensaverPhoto(file: Blob, passcode: string): Promise<void> {
  const form = new FormData();
  form.set("passcode", passcode);
  form.set("photo", file, "photo.jpg");
  const res = await fetch("/api/screensaver-photos", { method: "POST", body: form });
  if (!res.ok) {
    const body = await res.json();
    throw new Error(body.error ?? "Couldn't upload the photo.");
  }
}

export async function deleteScreensaverPhoto(path: string, passcode: string): Promise<void> {
  const res = await fetch("/api/screensaver-photos", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path, passcode }),
  });
  if (!res.ok) {
    const body = await res.json();
    throw new Error(body.error ?? "Couldn't delete the photo.");
  }
}
