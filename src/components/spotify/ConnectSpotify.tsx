"use client";

import { useState } from "react";
import { startAuthFlow } from "@/lib/spotify/auth";
import { saveClientId } from "@/lib/spotify/config";

export function ConnectSpotify({ initialClientId }: { initialClientId: string | null }) {
  const [clientId, setClientId] = useState(initialClientId ?? "");
  const [connecting, setConnecting] = useState(false);

  async function handleConnect(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = clientId.trim();
    if (!trimmed) return;
    setConnecting(true);
    saveClientId(trimmed);
    await startAuthFlow(trimmed);
  }

  return (
    <div className="mx-auto max-w-[500px] py-6">
      <p className="instrument-label">Spotify</p>
      <h2 className="font-display mt-3 text-[32px] font-normal leading-tight">Connect Spotify</h2>
      <p className="mt-2 text-[15px] text-[var(--text-secondary)]">
        One-time setup. Create a free Spotify Developer app, add{" "}
        <code className="text-[13px]">
          {typeof window !== "undefined" ? window.location.origin : "https://your-app.vercel.app"}
          /spotify/callback
        </code>{" "}
        as a redirect URI, and paste the Client ID below.
      </p>

      <form onSubmit={handleConnect} className="mt-6 flex flex-col gap-4">
        <label className="block text-[14px] text-[var(--text-secondary)]">
          Client ID
          <input
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            placeholder="e.g. 8f3d2a1c9b..."
            required
            className="spotify-input mt-1.5 block w-full text-[var(--foreground)]"
          />
        </label>

        <button
          type="submit"
          disabled={connecting}
          className="mt-1 h-[52px] rounded-[13px] text-[16px] font-medium text-black transition disabled:opacity-50"
          style={{
            background: "var(--accent-spotify)",
            boxShadow: "0 0 24px -6px color-mix(in srgb, var(--accent-spotify) 55%, transparent)",
          }}
        >
          {connecting ? "Redirecting…" : "Connect with Spotify"}
        </button>
      </form>

      <p className="mt-5 text-[13px] text-[var(--text-tertiary)]">
        Requires a Spotify Premium account, and Spotify added as a linked service in the Sonos
        app, for playback control to work.
      </p>
    </div>
  );
}
