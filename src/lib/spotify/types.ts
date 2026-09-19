export type SpotifyTokens = {
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // epoch ms
};

export type SpotifyDevice = {
  id: string | null;
  name: string;
  type: string;
  is_active: boolean;
  volume_percent: number | null;
};

export type SpotifyTrack = {
  name: string;
  artists: { name: string }[];
  album: { name: string; images: { url: string; width: number; height: number }[] };
  duration_ms: number;
};

export type SpotifyPlaybackState = {
  is_playing: boolean;
  progress_ms: number | null;
  item: SpotifyTrack | null;
  device: SpotifyDevice | null;
  shuffle_state: boolean;
  repeat_state: "off" | "track" | "context";
};
