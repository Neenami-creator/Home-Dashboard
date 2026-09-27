"use client";

import Link from "next/link";
import { ChevronLeft, Settings } from "lucide-react";
import type { ReactNode } from "react";

export function PanelShell({
  title,
  accent,
  status,
  children,
}: {
  title: string;
  accent: string;
  /** Small live status shown top-right, e.g. "Playing in Kitchen" or "3 rooms online". */
  status?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-20 items-center justify-between gap-4 px-8">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            aria-label="Home"
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-[var(--border)] text-[var(--text-secondary)] transition-colors hover:border-[var(--border-strong)] hover:text-[var(--foreground)]"
          >
            <ChevronLeft size={22} strokeWidth={1.7} />
          </Link>
          <h1 className="font-display text-[32px] font-normal text-[var(--foreground)]">{title}</h1>
        </div>

        <div className="flex items-center gap-4">
          {status && (
            <span className="flex items-center gap-1.5 text-[15px] text-[var(--text-secondary)]">
              {status}
              <span className="h-[6px] w-[6px] rounded-full" style={{ backgroundColor: accent }} />
            </span>
          )}
          <Link
            href="/settings"
            aria-label="Settings"
            className="flex h-10 w-10 items-center justify-center rounded-full text-[var(--text-tertiary)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--text-secondary)]"
          >
            <Settings size={17} strokeWidth={1.7} />
          </Link>
        </div>
      </header>
      <main className="flex-1 overflow-y-auto px-8 pb-8">
        <div className="animate-fade-in">{children}</div>
      </main>
    </div>
  );
}
