import { loadBridgeConfig } from "@/lib/hue/config";
import { recallScene } from "@/lib/hue/client";
import { loadClientId } from "@/lib/spotify/config";
import { getValidAccessToken } from "@/lib/spotify/auth";
import { pause } from "@/lib/spotify/client";
import type { Routine } from "./types";

export type RoutineRunResult = {
  scenesApplied: number;
  scenesFailed: number;
  spotifyPaused: boolean;
};

// Fires every configured action in parallel and swallows individual
// failures (a routine is a convenience shortcut, not a transaction - one
// unreachable room shouldn't stop the others, or a movie routine's music
// pause, from happening).
export async function runRoutine(routine: Routine): Promise<RoutineRunResult> {
  const bridgeConfig = loadBridgeConfig();
  const sceneIds = Object.values(routine.sceneByRoom).filter((id): id is string => Boolean(id));

  const sceneResults = bridgeConfig
    ? await Promise.allSettled(sceneIds.map((sceneId) => recallScene(bridgeConfig, sceneId)))
    : [];

  let spotifyPaused = false;
  if (routine.pauseSpotify) {
    const clientId = loadClientId();
    if (clientId) {
      const accessToken = await getValidAccessToken(clientId).catch(() => null);
      if (accessToken) {
        spotifyPaused = await pause(accessToken)
          .then(() => true)
          .catch(() => false);
      }
    }
  }

  return {
    scenesApplied: sceneResults.filter((r) => r.status === "fulfilled").length,
    scenesFailed: sceneResults.filter((r) => r.status === "rejected").length,
    spotifyPaused,
  };
}
