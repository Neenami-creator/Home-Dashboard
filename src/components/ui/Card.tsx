import type { CSSProperties, ReactNode } from "react";

export function Card({
  children,
  className = "",
  glow,
  active,
}: {
  children: ReactNode;
  className?: string;
  /** Accent color (CSS value) to tint the border/background when active. */
  glow?: string;
  active?: boolean;
}) {
  const style: CSSProperties | undefined =
    glow && active
      ? {
          borderColor: `color-mix(in srgb, ${glow} 45%, transparent)`,
          background: `color-mix(in srgb, ${glow} 10%, var(--surface))`,
          boxShadow: `0 0 0 1px color-mix(in srgb, ${glow} 15%, transparent), 0 8px 30px -12px color-mix(in srgb, ${glow} 35%, transparent)`,
        }
      : undefined;

  return (
    <div
      className={`rounded-2xl border border-[var(--border)] bg-[var(--surface)] backdrop-blur-sm transition-colors ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}
