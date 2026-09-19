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
    <form
      onSubmit={handleConnect}
      className="mx-auto max-w-md rounded-2xl border border-white/10 bg-white/5 p-6"
    >
      <h2 className="text-lg font-medium">Connect Spotify</h2>
      <p className="mt-1 text-sm text-white/60">
        One-time setup. Create a free Spotify Developer app, add{" "}
        <code className="text-xs">
          {typeof window !== "undefined" ? window.location.origin : "https://your-app.vercel.app"}
          /spotify/callback
        </code>{" "}
        as a redirect URI, and paste the Client ID below.
      </p>

      <label className="mt-4 block text-sm text-white/70">
        Client ID
        <input
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
          placeholder="e.g. 8f3d2a1c9b..."
          required
          className="mt-1 w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-white"
        />
      </label>

      <button
        type="submit"
        disabled={connecting}
        className="mt-5 w-full rounded-lg bg-[#1ed760] py-2 font-medium text-black transition disabled:opacity-50"
      >
        {connecting ? "Redirecting…" : "Connect with Spotify"}
      </button>

      <p className="mt-4 text-xs text-white/40">
        Requires a Spotify Premium account, and Spotify added as a linked service in the Sonos
        app, for playback control to work.
      </p>
    </form>
  );
}
