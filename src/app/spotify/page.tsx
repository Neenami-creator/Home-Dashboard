import { PanelShell } from "@/components/PanelShell";

export default function SpotifyPage() {
  return (
    <PanelShell title="Spotify" accent="#1ed760">
      <p className="text-white/50">
        Sonos playback control is next up: now-playing card, play/pause/skip/volume and a
        device picker, backed by Spotify&apos;s PKCE auth flow.
      </p>
    </PanelShell>
  );
}
