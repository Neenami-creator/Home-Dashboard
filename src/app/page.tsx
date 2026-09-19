import Link from "next/link";

const PANELS = [
  {
    href: "/hue",
    name: "Hue Lights",
    description: "Room-by-room light control",
    accent: "#f5c94a",
    status: "ready" as const,
  },
  {
    href: "/spotify",
    name: "Spotify",
    description: "Sonos playback control",
    accent: "#1ed760",
    status: "coming-soon" as const,
  },
  {
    href: "/weather",
    name: "Weather",
    description: "BOM current conditions & forecast",
    accent: "#4ea8ff",
    status: "coming-soon" as const,
  },
  {
    href: "/recipes",
    name: "Recipes",
    description: "The recipe library",
    accent: "#ff8a5c",
    status: "coming-soon" as const,
  },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-10 p-8">
      <h1 className="text-3xl font-semibold tracking-tight text-white/90">Home Dashboard</h1>

      <div className="grid w-full max-w-3xl grid-cols-2 gap-5">
        {PANELS.map((panel) => (
          <Link
            key={panel.href}
            href={panel.href}
            className="group relative flex aspect-square flex-col justify-end overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 transition hover:bg-white/10"
          >
            <span
              className="absolute inset-x-0 top-0 h-1"
              style={{ backgroundColor: panel.accent }}
            />
            <span className="text-2xl font-medium">{panel.name}</span>
            <span className="mt-1 text-sm text-white/50">{panel.description}</span>
            {panel.status === "coming-soon" && (
              <span className="absolute right-5 top-5 rounded-full border border-white/15 px-3 py-1 text-xs text-white/50">
                Coming soon
              </span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
