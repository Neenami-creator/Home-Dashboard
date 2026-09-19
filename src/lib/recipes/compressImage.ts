// Keeps recipe photos web-compressed before they ever leave the browser,
// since the Supabase project's 1GB free-tier storage is shared with
// Wardrobe Edit's garment photos.
const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 0.82;

export async function compressImage(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Couldn't process the image.");
  ctx.drawImage(bitmap, 0, 0, width, height);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Couldn't compress the image."))),
      "image/jpeg",
      JPEG_QUALITY
    );
  });
}
