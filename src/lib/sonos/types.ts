export type SonosTokens = {
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // epoch ms
};

export type SonosHousehold = {
  id: string;
};

export type SonosPlayer = {
  id: string;
  name: string;
};

export type SonosGroup = {
  id: string;
  name: string;
  coordinatorId: string;
  playerIds: string[];
};
