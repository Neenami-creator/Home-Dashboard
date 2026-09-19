import type { BridgeConfig } from "./types";

export type HueLightUpdate = {
  groupedLightId: string;
  on?: boolean;
  brightness?: number;
};

type HueEventResource = {
  id: string;
  type: string;
  on?: { on: boolean };
  dimming?: { brightness: number };
};

type HueEvent = {
  type: string;
  data: HueEventResource[];
};

/**
 * Subscribes to the bridge's CLIP v2 event stream (server-sent events) so
 * room tiles update the instant a light changes state - from this panel,
 * the Hue app, a physical switch, or a schedule - instead of waiting for
 * the next poll. `EventSource` can't send the required `hue-application-key`
 * header, so this reads the stream manually via `fetch`.
 *
 * Returns an unsubscribe function. Reconnects automatically with backoff if
 * the bridge drops the connection; call the returned function to stop that.
 */
export function subscribeToHueEvents(
  config: BridgeConfig,
  onUpdate: (updates: HueLightUpdate[]) => void,
  onStatusChange?: (status: "connected" | "disconnected") => void
): () => void {
  const controller = new AbortController();
  let stopped = false;
  let reconnectDelayMs = 1000;

  async function connect() {
    while (!stopped) {
      try {
        const res = await fetch(`https://${config.ip}/eventstream/clip/v2`, {
          headers: {
            "hue-application-key": config.appKey,
            Accept: "text/event-stream",
          },
          signal: controller.signal,
        });

        if (!res.ok || !res.body) {
          throw new Error(`Event stream returned ${res.status}`);
        }

        onStatusChange?.("connected");
        reconnectDelayMs = 1000;

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (!stopped) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          const events = buffer.split("\n\n");
          buffer = events.pop() ?? "";

          for (const chunk of events) {
            const dataLine = chunk
              .split("\n")
              .find((line) => line.startsWith("data:"));
            if (!dataLine) continue;

            try {
              const payload = JSON.parse(dataLine.slice(5).trim()) as HueEvent[];
              const updates: HueLightUpdate[] = [];
              for (const event of payload) {
                if (event.type !== "update") continue;
                for (const resource of event.data) {
                  if (resource.type !== "grouped_light") continue;
                  updates.push({
                    groupedLightId: resource.id,
                    on: resource.on?.on,
                    brightness: resource.dimming?.brightness,
                  });
                }
              }
              if (updates.length > 0) onUpdate(updates);
            } catch {
              // Malformed or partial event - skip it, the next one will arrive shortly.
            }
          }
        }
      } catch (err) {
        if (stopped || (err instanceof DOMException && err.name === "AbortError")) return;
      }

      onStatusChange?.("disconnected");
      if (stopped) return;
      await new Promise((resolve) => setTimeout(resolve, reconnectDelayMs));
      reconnectDelayMs = Math.min(reconnectDelayMs * 2, 30_000);
    }
  }

  connect();

  return () => {
    stopped = true;
    controller.abort();
  };
}
