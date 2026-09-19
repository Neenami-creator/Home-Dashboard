import Link from "next/link";
import type { ReactNode } from "react";

export function PanelShell({
  title,
  accent,
  children,
}: {
  title: string;
  accent: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center gap-4 border-b border-white/10 px-6 py-4">
        <Link
          href="/"
          className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/70 transition hover:bg-white/10 hover:text-white"
        >
          ← Dashboard
        </Link>
        <h1 className="text-xl font-semibold" style={{ color: accent }}>
          {title}
        </h1>
      </header>
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
    </div>
  );
}
