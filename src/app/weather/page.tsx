import { PanelShell } from "@/components/PanelShell";

export default function WeatherPage() {
  return (
    <PanelShell title="Weather" accent="#4ea8ff">
      <p className="text-white/50">
        BOM current conditions and short-range forecast, defaulting to Adelaide with other
        cities selectable, is coming next.
      </p>
    </PanelShell>
  );
}
