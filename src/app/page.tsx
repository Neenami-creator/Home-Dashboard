import Link from "next/link";
import { PANELS } from "@/lib/panels";
import { Clock } from "@/components/Clock";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-12 p-8">
      <div className="text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-[var(--text-tertiary)]">
          Home Dashboard
        </p>
        <div className="mt-3">
          <Clock className="[&_p:first-child]:text-center [&_p:first-child]:text-5xl [&_p:last-child]:text-center [&_p:last-child]:text-sm" />
        </div>
      </div>

      <div className="grid w-full max-w-3xl grid-cols-2 gap-5">
        {PANELS.map((panel) => {
          const Icon = panel.icon;
          return (
            <Link
              key={panel.href}
              href={panel.href}
              className="group relative flex aspect-square flex-col justify-between overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 transition hover:border-[var(--border-strong)] hover:bg-[var(--surface-hover)]"
            >
              <div
                className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full opacity-20 blur-3xl transition group-hover:opacity-30"
                style={{ backgroundColor: panel.accent }}
              />
              <div
                className="flex h-12 w-12 items-center justify-center rounded-2xl"
                style={{ backgroundColor: `color-mix(in srgb, ${panel.accent} 18%, transparent)`, color: panel.accent }}
              >
                <Icon size={24} />
              </div>
              <div>
                <span className="block text-2xl font-medium">{panel.name}</span>
                <span className="mt-1 block text-sm text-[var(--text-secondary)]">
                  {panel.description}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
