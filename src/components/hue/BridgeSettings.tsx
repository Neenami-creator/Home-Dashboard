"use client";

import { useState } from "react";
import type { BridgeConfig } from "@/lib/hue/types";
import { testBridgeConnection, HueBridgeError } from "@/lib/hue/client";

export function BridgeSettings({
  initial,
  onSave,
}: {
  initial: BridgeConfig | null;
  onSave: (config: BridgeConfig) => void;
}) {
  const [ip, setIp] = useState(initial?.ip ?? "");
  const [appKey, setAppKey] = useState(initial?.appKey ?? "");
  const [status, setStatus] = useState<"idle" | "testing" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("testing");
    setError(null);
    const config = { ip: ip.trim(), appKey: appKey.trim() };
    try {
      await testBridgeConnection(config);
      onSave(config);
      setStatus("idle");
    } catch (err) {
      setStatus("error");
      setError(err instanceof HueBridgeError ? err.message : "Couldn't connect to the bridge.");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto max-w-md rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6"
    >
      <h2 className="text-lg font-medium">Connect to your Hue bridge</h2>
      <p className="mt-1 text-sm text-[var(--text-secondary)]">
        One-time setup. You&apos;ll need the bridge&apos;s local IP and an application key
        generated after pressing the bridge&apos;s link button.
      </p>

      <label className="mt-4 block text-sm text-[var(--text-secondary)]">
        Bridge IP address
        <input
          value={ip}
          onChange={(e) => setIp(e.target.value)}
          placeholder="192.168.1.50"
          required
          className="mt-1 w-full rounded-lg border border-[var(--border)] bg-black/30 px-3 py-2 text-[var(--foreground)]"
        />
      </label>

      <label className="mt-3 block text-sm text-[var(--text-secondary)]">
        Application key
        <input
          value={appKey}
          onChange={(e) => setAppKey(e.target.value)}
          placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
          required
          className="mt-1 w-full rounded-lg border border-[var(--border)] bg-black/30 px-3 py-2 text-[var(--foreground)]"
        />
      </label>

      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={status === "testing"}
        className="mt-5 w-full rounded-lg bg-[var(--accent-hue)] py-2 font-medium text-black transition disabled:opacity-50"
      >
        {status === "testing" ? "Connecting…" : "Connect"}
      </button>

      <p className="mt-4 text-xs text-[var(--text-tertiary)]">
        Tip: visit <code>https://{ip || "<bridge-ip>"}</code> in Safari once and accept the
        certificate warning, or requests from this page will silently fail.
      </p>
    </form>
  );
}
