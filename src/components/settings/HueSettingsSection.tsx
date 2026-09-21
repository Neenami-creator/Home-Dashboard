"use client";

import { useState, type CSSProperties } from "react";
import { Lightbulb } from "lucide-react";
import { BridgeSettings } from "@/components/hue/BridgeSettings";
import { loadBridgeConfig, saveBridgeConfig, clearBridgeConfig } from "@/lib/hue/config";

export function HueSettingsSection() {
  const [config, setConfig] = useState(loadBridgeConfig());
  const [editing, setEditing] = useState(false);

  return (
    <section>
      <h2 className="mb-3 flex items-center gap-2">
        <Lightbulb size={16} strokeWidth={1.7} className="text-[var(--accent-hue)]" />
        <span className="instrument-label">Hue</span>
      </h2>
      {config && !editing ? (
        <div
          className="control-surface flex items-center justify-between p-5"
          style={{ "--accent": "var(--accent-hue)" } as CSSProperties}
          data-active
        >
          <div>
            <p className="text-[15px]">Connected to bridge</p>
            <p className="text-[12px] text-[var(--text-tertiary)]">{config.ip}</p>
          </div>
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
                clearBridgeConfig();
                setConfig(null);
              }}
              className="rounded-[10px] border border-[var(--border)] bg-[var(--surface-2)] px-3 py-1.5 text-[12px] text-[var(--text-secondary)] transition-colors hover:border-[var(--border-strong)]"
            >
              Forget
            </button>
          </div>
        </div>
      ) : (
        <BridgeSettings
          initial={config}
          onSave={(cfg) => {
            saveBridgeConfig(cfg);
            setConfig(cfg);
            setEditing(false);
          }}
        />
      )}
    </section>
  );
}
