"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Settings } from "lucide-react";
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
      <header className="flex h-[72px] items-center justify-between gap-4 border-b border-[var(--border)] px-8">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            aria-label="Home"
            className="flex h-10 w-10 items-center justify-center rounded-[14px] border border-[var(--border)] bg-[var(--surface-2)] text-[var(--text-secondary)] shadow-[inset_0_1px_0_var(--inset-highlight)] transition-colors hover:border-[var(--border-strong)] hover:text-[var(--foreground)]"
          >
            <Home size={17} strokeWidth={1.7} />
          </Link>
          <h1 className="font-display flex items-center gap-2 text-xl font-medium text-[var(--foreground)]">
            {title}
            <span className="h-[5px] w-[5px] rounded-full" style={{ backgroundColor: accent }} />
          </h1>
        </div>

        <nav
          className="hidden items-center gap-1 rounded-[16px] border p-1 sm:flex"
          style={{ height: 50, background: "rgba(255,255,255,0.018)", borderColor: "rgba(255,255,255,0.05)" }}
        >
          {PANELS.map((panel) => {
            const isActive = pathname.startsWith(panel.href);
            const Icon = panel.icon;
            return (
              <Link
                key={panel.href}
                href={panel.href}
                aria-label={panel.name}
                className="relative flex h-[42px] w-[42px] items-center justify-center rounded-xl transition-colors"
                style={
                  isActive
                    ? { background: "var(--surface-2)", color: panel.accent }
                    : { color: "var(--text-tertiary)" }
                }
              >
                <Icon size={19} strokeWidth={1.7} />
                {isActive && (
                  <span
                    className="absolute bottom-1 h-[2px] w-3 rounded-full"
                    style={{ backgroundColor: panel.accent }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-4">
          <Link
            href="/settings"
            aria-label="Settings"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-[var(--text-tertiary)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--text-secondary)]"
          >
            <Settings size={16} strokeWidth={1.7} />
          </Link>
          <Clock className="[&_p:first-child]:text-[18px] [&_p:last-child]:text-[11px] [&_p:last-child]:tracking-[0.06em]" />
        </div>
      </header>
      <main className="flex-1 overflow-y-auto p-6">
        <div className="animate-fade-in">{children}</div>
      </main>
    </div>
  );
}
