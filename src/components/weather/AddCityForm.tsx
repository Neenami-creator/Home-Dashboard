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
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto mb-6 max-w-md rounded-2xl border border-white/10 bg-white/5 p-6"
    >
      <h2 className="text-lg font-medium">Add a city</h2>
      <p className="mt-1 text-sm text-white/60">
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

      <label className="mt-4 block text-sm text-white/70">
        Name
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Whyalla"
          required
          className="mt-1 w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-white"
        />
      </label>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <label className="block text-sm text-white/70">
          Observation product
          <input
            value={obsProduct}
            onChange={(e) => setObsProduct(e.target.value)}
            placeholder="IDS60901"
            required
            className="mt-1 w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-white"
          />
        </label>
        <label className="block text-sm text-white/70">
          Station number
          <input
            value={obsStation}
            onChange={(e) => setObsStation(e.target.value)}
            placeholder="94654"
            required
            className="mt-1 w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-white"
          />
        </label>
        <label className="block text-sm text-white/70">
          Forecast product
          <input
            value={fcProduct}
            onChange={(e) => setFcProduct(e.target.value)}
            placeholder="IDS10044"
            required
            className="mt-1 w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-white"
          />
        </label>
        <label className="block text-sm text-white/70">
          Forecast area code
          <input
            value={fcAac}
            onChange={(e) => setFcAac(e.target.value)}
            placeholder="SA_PW010"
            required
            className="mt-1 w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-white"
          />
        </label>
      </div>

      <div className="mt-5 flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-lg border border-white/15 py-2 text-white/70"
        >
          Cancel
        </button>
        <button type="submit" className="flex-1 rounded-lg bg-blue-300 py-2 font-medium text-black">
          Add
        </button>
      </div>
    </form>
  );
}
