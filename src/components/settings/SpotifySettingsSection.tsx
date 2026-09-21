"use client";

import { useState, type CSSProperties } from "react";
import { Music2 } from "lucide-react";
import { ConnectSpotify } from "@/components/spotify/ConnectSpotify";
import { loadClientId } from "@/lib/spotify/config";
import { disconnect, isConnected } from "@/lib/spotify/auth";

export function SpotifySettingsSection() {
  const [connected, setConnected] = useState(isConnected());
  const [editing, setEditing] = useState(false);
  const clientId = loadClientId();

  return (
    <section>
      <h2 className="mb-3 flex items-center gap-2">
        <Music2 size={16} strokeWidth={1.7} className="text-[var(--accent-spotify)]" />
        <span className="instrument-label">Spotify</span>
      </h2>
      {connected && !editing ? (
        <div
          className="control-surface flex items-center justify-between p-5"
          style={{ "--accent": "var(--accent-spotify)" } as CSSProperties}
          data-active
        >
          <p className="text-[15px]">Connected</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="rounded-[10px] border border-[var(--border)] bg-[var(--surface-2)] px-3 py-1.5 text-[12px] text-[var(--text-secondary)] transition-colors hover:border-[var(--border-strong)]"
            >
              Change
            </button>
            <button
              type="button"
              onClick={() => {
                disconnect();
                setConnected(false);
              }}
              className="rounded-[10px] border border-[var(--border)] bg-[var(--surface-2)] px-3 py-1.5 text-[12px] text-[var(--text-secondary)] transition-colors hover:border-[var(--border-strong)]"
            >
              Disconnect
            </button>
          </div>
        </div>
      ) : (
        <ConnectSpotify initialClientId={clientId} />
      )}
    </section>
  );
}
