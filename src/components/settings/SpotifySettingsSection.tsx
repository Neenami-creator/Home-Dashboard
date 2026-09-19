"use client";

import { useState } from "react";
import { Music2 } from "lucide-react";
import { ConnectSpotify } from "@/components/spotify/ConnectSpotify";
import { Card } from "@/components/ui/Card";
import { loadClientId } from "@/lib/spotify/config";
import { disconnect, isConnected } from "@/lib/spotify/auth";

export function SpotifySettingsSection() {
  const [connected, setConnected] = useState(isConnected());
  const [editing, setEditing] = useState(false);
  const clientId = loadClientId();

  return (
    <section>
      <h2 className="mb-3 flex items-center gap-2 text-lg font-medium">
        <Music2 size={18} className="text-[var(--accent-spotify)]" />
        Spotify
      </h2>
      {connected && !editing ? (
        <Card className="flex items-center justify-between p-5">
          <p className="text-sm">Connected</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="rounded-full border border-[var(--border)] px-3 py-1.5 text-xs text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]"
            >
              Change
            </button>
            <button
              type="button"
              onClick={() => {
                disconnect();
                setConnected(false);
              }}
              className="rounded-full border border-[var(--border)] px-3 py-1.5 text-xs text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]"
            >
              Disconnect
            </button>
          </div>
        </Card>
      ) : (
        <ConnectSpotify initialClientId={clientId} />
      )}
    </section>
  );
}
