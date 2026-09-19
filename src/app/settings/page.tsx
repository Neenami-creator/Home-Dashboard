"use client";

import { useEffect, useState } from "react";
import { PanelShell } from "@/components/PanelShell";
import { HueSettingsSection } from "@/components/settings/HueSettingsSection";
import { SpotifySettingsSection } from "@/components/settings/SpotifySettingsSection";
import { RoutinesSettingsSection } from "@/components/settings/RoutinesSettingsSection";
import { RecipesSettingsSection } from "@/components/settings/RecipesSettingsSection";
import { ScreensaverSettingsSection } from "@/components/settings/ScreensaverSettingsSection";

export default function SettingsPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Every section here reads localStorage; avoid rendering their real
    // state until after the client mount to prevent a hydration mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  return (
    <PanelShell title="Settings" accent="var(--foreground)">
      <div className="mx-auto max-w-2xl space-y-10">
        {mounted && (
          <>
            <HueSettingsSection />
            <SpotifySettingsSection />
            <div id="routines">
              <RoutinesSettingsSection />
            </div>
            <RecipesSettingsSection />
            <ScreensaverSettingsSection />
          </>
        )}
      </div>
    </PanelShell>
  );
}
