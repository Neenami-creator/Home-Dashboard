"use client";

import { useEffect, useState } from "react";
import { Image as ImageIcon, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { compressImage } from "@/lib/recipes/compressImage";
import { listScreensaverPhotos, uploadScreensaverPhoto, deleteScreensaverPhoto } from "@/lib/screensaver/queries";

const PASSCODE_STORAGE_KEY = "recipe-upload-passcode";

export function ScreensaverSettingsSection() {
  const [photos, setPhotos] = useState<{ path: string; url: string }[] | null>(null);
  const [passcode, setPasscode] = useState(
    typeof window !== "undefined" ? (window.sessionStorage.getItem(PASSCODE_STORAGE_KEY) ?? "") : ""
  );
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function refresh() {
    listScreensaverPhotos()
      .then(setPhotos)
      .catch((err) => setError(err instanceof Error ? err.message : "Couldn't load photos."));
  }

  useEffect(refresh, []);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !passcode) return;
    setUploading(true);
    setError(null);
    try {
      const compressed = await compressImage(file);
      await uploadScreensaverPhoto(compressed, passcode);
      window.sessionStorage.setItem(PASSCODE_STORAGE_KEY, passcode);
      refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't upload the photo.");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(path: string) {
    try {
      await deleteScreensaverPhoto(path, passcode);
      refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't delete the photo.");
    }
  }

  return (
    <section>
      <h2 className="mb-1 flex items-center gap-2 text-lg font-medium">
        <ImageIcon size={18} className="text-[var(--text-secondary)]" />
        Screensaver photos
      </h2>
      <p className="mb-3 text-sm text-[var(--text-secondary)]">
        Shown one at a time behind the clock while idle, alongside the current weather. Uses
        the same passcode as recipe uploads.
      </p>

      <Card className="p-5">
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="password"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            placeholder="Passcode"
            className="rounded-lg border border-[var(--border)] bg-black/30 px-3 py-1.5 text-sm text-[var(--foreground)]"
          />
          <label className="cursor-pointer rounded-full border border-[var(--border)] px-3 py-1.5 text-xs text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]">
            {uploading ? "Uploading…" : "+ Add photo"}
            <input
              type="file"
              accept="image/*"
              onChange={handleUpload}
              disabled={uploading || !passcode}
              className="hidden"
            />
          </label>
        </div>

        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

        {photos && photos.length > 0 && (
          <div className="mt-4 grid grid-cols-4 gap-2">
            {photos.map((photo) => (
              <div key={photo.path} className="group relative aspect-square overflow-hidden rounded-lg">
                {/* eslint-disable-next-line @next/next/no-img-element -- thumbnail from Supabase storage, not worth Next/Image config for a settings-only grid */}
                <img src={photo.url} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => handleDelete(photo.path)}
                  aria-label="Delete photo"
                  className="absolute inset-0 hidden items-center justify-center bg-black/60 group-hover:flex"
                >
                  <Trash2 size={16} className="text-white" />
                </button>
              </div>
            ))}
          </div>
        )}

        {photos?.length === 0 && (
          <p className="mt-3 text-xs text-[var(--text-tertiary)]">
            No photos yet — the screensaver falls back to just the clock.
          </p>
        )}
      </Card>
    </section>
  );
}
