import type { CityWeather, WeatherCity } from "./types";

export async function fetchCityWeather(city: WeatherCity): Promise<CityWeather> {
  const params = new URLSearchParams({
    obsProduct: city.obsProduct,
    obsStation: city.obsStation,
    fcProduct: city.fcProduct,
    fcAac: city.fcAac,
  });
  const res = await fetch(`/api/weather?${params.toString()}`);
  if (!res.ok) {
    throw new Error(`Weather request failed (${res.status})`);
  }
  return (await res.json()) as CityWeather;
}
