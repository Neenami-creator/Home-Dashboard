export type WeatherCity = {
  id: string;
  name: string;
  // BOM's public JSON mirrors of its FTP product files, addressed by
  // product ID + station number (observations) or product ID + AAC area
  // code (forecast). See README for how to find these for a new city.
  obsProduct: string;
  obsStation: string;
  fcProduct: string;
  fcAac: string;
  // BOM radar product ID (e.g. "IDR643") covering this city, if known.
  // Optional: the radar strip is simply hidden for a city without one.
  radarId?: string;
  builtIn?: boolean;
};

export type CurrentConditions = {
  stationName: string;
  observedAt: string; // as BOM reports it, e.g. "3:00pm"
  airTempC: number | null;
  feelsLikeC: number | null;
  humidityPercent: number | null;
  windDirection: string | null;
  windSpeedKmh: number | null;
  gustKmh: number | null;
  conditionText: string | null;
};

export type ForecastDay = {
  date: string; // ISO date
  precis: string;
  minTempC: number | null;
  maxTempC: number | null;
  chanceOfRainPercent: number | null;
};

export type CityWeather = {
  current: CurrentConditions | null;
  forecast: ForecastDay[];
  warnings: string[];
};
