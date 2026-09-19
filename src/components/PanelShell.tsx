"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home } from "lucide-react";
import type { ReactNode } from "react";
import { PANELS } from "@/lib/panels";
import { Clock } from "@/components/Clock";

export function PanelShell({
  title,
  accent,
  children,
}: {
  title: string;
  accent: string;
  children: ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between gap-4 border-b border-[var(--border)] px-6 py-4">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            aria-label="Home"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border)] text-[var(--text-secondary)] transition hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)]"
          >
            <Home size={18} />
          </Link>
          <h1 className="text-xl font-semibold" style={{ color: accent }}>
            {title}
          </h1>
        </div>

        <nav className="hidden items-center gap-1 rounded-full border border-[var(--border)] p-1 sm:flex">
          {PANELS.map((panel) => {
            const isActive = pathname.startsWith(panel.href);
            const Icon = panel.icon;
            return (
              <Link
                key={panel.href}
                href={panel.href}
                aria-label={panel.name}
                className="flex h-9 w-9 items-center justify-center rounded-full transition"
                style={
                  isActive
                    ? { backgroundColor: `color-mix(in srgb, ${panel.accent} 18%, transparent)`, color: panel.accent }
                    : { color: "var(--text-tertiary)" }
                }
              >
                <Icon size={17} />
              </Link>
            );
          })}
        </nav>

        <Clock />
      </header>
      <main className="flex-1 overflow-y-auto p-6">
        <div className="animate-fade-in">{children}</div>
      </main>
    </div>
  );
}
