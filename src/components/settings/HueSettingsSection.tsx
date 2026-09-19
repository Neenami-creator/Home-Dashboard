"use client";

import { useState } from "react";
import { Lightbulb } from "lucide-react";
import { BridgeSettings } from "@/components/hue/BridgeSettings";
import { loadBridgeConfig, saveBridgeConfig, clearBridgeConfig } from "@/lib/hue/config";
import { Card } from "@/components/ui/Card";

export function HueSettingsSection() {
  const [config, setConfig] = useState(loadBridgeConfig());
  const [editing, setEditing] = useState(false);

  return (
    <section>
      <h2 className="mb-3 flex items-center gap-2 text-lg font-medium">
        <Lightbulb size={18} className="text-[var(--accent-hue)]" />
        Hue
      </h2>
      {config && !editing ? (
        <Card className="flex items-center justify-between p-5">
          <div>
            <p className="text-sm">Connected to bridge</p>
            <p className="text-xs text-[var(--text-tertiary)]">{config.ip}</p>
          </div>
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
                clearBridgeConfig();
                setConfig(null);
              }}
              className="rounded-full border border-[var(--border)] px-3 py-1.5 text-xs text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]"
            >
              Forget
            </button>
          </div>
        </Card>
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
