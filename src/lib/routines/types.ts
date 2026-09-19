export type Routine = {
  id: string;
  name: string;
  icon: "dinner" | "cooking" | "movie" | "custom";
  // roomId -> sceneId. A room missing from this map, or mapped to null,
  // is left alone when the routine runs.
  sceneByRoom: Record<string, string | null>;
  pauseSpotify: boolean;
};
