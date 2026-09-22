"use client";

import { useState } from "react";
import type { WeatherCity } from "@/lib/weather/types";

export function AddCityForm({
  onAdd,
  onCancel,
}: {
  onAdd: (city: Omit<WeatherCity, "builtIn">) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [obsProduct, setObsProduct] = useState("");
  const [obsStation, setObsStation] = useState("");
  const [fcProduct, setFcProduct] = useState("");
  const [fcAac, setFcAac] = useState("");
  const [radarId, setRadarId] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !obsProduct.trim() || !obsStation.trim() || !fcProduct.trim() || !fcAac.trim()) {
      return;
    }
    onAdd({
      id: name.trim().toLowerCase().replace(/\s+/g, "-"),
      name: name.trim(),
      obsProduct: obsProduct.trim(),
      obsStation: obsStation.trim(),
      fcProduct: fcProduct.trim(),
      fcAac: fcAac.trim(),
      radarId: radarId.trim() || undefined,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="control-surface mx-auto mb-6 max-w-md p-6">
      <h2 className="font-display text-[19px] font-normal">Add a city</h2>
      <p className="mt-1 text-[13px] text-[var(--text-secondary)]">
        BOM doesn&apos;t publish a lookup for these codes. Find them on{" "}
        <a
          href="http://www.bom.gov.au/places/"
          target="_blank"
          rel="noreferrer"
          className="underline"
        >
          bom.gov.au/places
        </a>{" "}
        — open your browser&apos;s network tab while viewing the town&apos;s observation and
        forecast pages, and copy the IDs out of the <code>.json</code> URLs.
      </p>

      <label className="mt-4 block text-[13px] text-[var(--text-secondary)]">
        Name
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Whyalla"
          required
          className="weather-input mt-1.5 block w-full text-[var(--foreground)]"
        />
      </label>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <label className="block text-[13px] text-[var(--text-secondary)]">
          Observation product
          <input
            value={obsProduct}
            onChange={(e) => setObsProduct(e.target.value)}
            placeholder="IDS60901"
            required
            className="weather-input mt-1.5 block w-full text-[var(--foreground)]"
          />
        </label>
        <label className="block text-[13px] text-[var(--text-secondary)]">
          Station number
          <input
            value={obsStation}
            onChange={(e) => setObsStation(e.target.value)}
            placeholder="94654"
            required
            className="weather-input mt-1.5 block w-full text-[var(--foreground)]"
          />
        </label>
        <label className="block text-[13px] text-[var(--text-secondary)]">
          Forecast product
          <input
            value={fcProduct}
            onChange={(e) => setFcProduct(e.target.value)}
            placeholder="IDS10044"
            required
            className="weather-input mt-1.5 block w-full text-[var(--foreground)]"
          />
        </label>
        <label className="block text-[13px] text-[var(--text-secondary)]">
          Forecast area code
          <input
            value={fcAac}
            onChange={(e) => setFcAac(e.target.value)}
            placeholder="SA_PW010"
            required
            className="weather-input mt-1.5 block w-full text-[var(--foreground)]"
          />
        </label>
      </div>

      <label className="mt-3 block text-[13px] text-[var(--text-secondary)]">
        Radar ID (optional)
        <input
          value={radarId}
          onChange={(e) => setRadarId(e.target.value)}
          placeholder="IDR643"
          className="weather-input mt-1.5 block w-full text-[var(--foreground)]"
        />
      </label>

      <div className="mt-5 flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-[12px] border border-[var(--border)] py-2.5 text-[14px] text-[var(--text-secondary)] transition-colors hover:border-[var(--border-strong)]"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 rounded-[12px] py-2.5 text-[14px] font-medium text-black"
          style={{ background: "var(--accent-weather)" }}
        >
          Add
        </button>
      </div>
    </form>
  );
}
