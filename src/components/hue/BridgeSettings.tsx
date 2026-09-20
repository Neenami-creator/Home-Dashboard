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
    <div className="mx-auto max-w-[500px] py-6">
      <p className="instrument-label">Hue</p>
      <h2 className="font-display mt-3 text-[32px] font-normal leading-tight">Connect your bridge</h2>
      <p className="mt-2 text-[15px] text-[var(--text-secondary)]">
        One-time setup. You&apos;ll need the bridge&apos;s local IP and an application key
        generated after pressing the bridge&apos;s link button.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <label className="block text-[14px] text-[var(--text-secondary)]">
          Bridge IP address
          <input
            value={ip}
            onChange={(e) => setIp(e.target.value)}
            placeholder="192.168.1.50"
            required
            className="hue-input mt-1.5 block w-full text-[var(--foreground)]"
          />
        </label>

        <label className="block text-[14px] text-[var(--text-secondary)]">
          Application key
          <input
            value={appKey}
            onChange={(e) => setAppKey(e.target.value)}
            placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
            required
            className="hue-input mt-1.5 block w-full text-[var(--foreground)]"
          />
        </label>

        {error && <p className="text-[14px] text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={status === "testing"}
          className="mt-1 h-[52px] rounded-[13px] text-[16px] font-medium text-black transition disabled:opacity-50"
          style={{
            background: "var(--accent-hue)",
            boxShadow: "0 0 24px -6px color-mix(in srgb, var(--accent-hue) 55%, transparent)",
          }}
        >
          {status === "testing" ? "Connecting…" : "Connect"}
        </button>
      </form>

      <p className="mt-5 text-[13px] text-[var(--text-tertiary)]">
        Tip: visit <code>https://{ip || "<bridge-ip>"}</code> in Safari once and accept the
        certificate warning, or requests from this page will silently fail.
      </p>
    </div>
  );
}
