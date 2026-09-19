"use client";

// Extracts an approximate dominant color from an image so a UI can tint
// itself to match - e.g. the Spotify panel glowing the color of whatever
// album art is currently showing, the way Apple Music/Spotify's own apps do.
// Downscales to a tiny canvas and averages pixels rather than doing real
// clustering, which is plenty for a soft background glow and avoids a
// color-quantization dependency for something this decorative.
export function extractDominantColor(imageUrl: string): Promise<string | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      try {
        const size = 16;
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (!ctx) return resolve(null);

        ctx.drawImage(img, 0, 0, size, size);
        const { data } = ctx.getImageData(0, 0, size, size);

        let r = 0;
        let g = 0;
        let b = 0;
        let count = 0;

        for (let i = 0; i < data.length; i += 4) {
          const alpha = data[i + 3];
          if (alpha < 200) continue;
          r += data[i];
          g += data[i + 1];
          b += data[i + 2];
          count++;
        }

        if (count === 0) return resolve(null);
        r = Math.round(r / count);
        g = Math.round(g / count);
        b = Math.round(b / count);

        // Boost saturation/brightness a touch - a raw average of album art
        // tends toward muddy gray, which makes a poor glow color.
        const max = Math.max(r, g, b) || 1;
        const boost = Math.min(255 / max, 1.6);
        r = Math.min(255, Math.round(r * boost));
        g = Math.min(255, Math.round(g * boost));
        b = Math.min(255, Math.round(b * boost));

        resolve(`rgb(${r}, ${g}, ${b})`);
      } catch {
        // Canvas can throw a SecurityError if the image didn't actually
        // serve permissive CORS headers despite crossOrigin being set.
        resolve(null);
      }
    };

    img.onerror = () => resolve(null);
    img.src = imageUrl;
  });
}
