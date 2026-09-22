import type { CSSProperties } from "react";

export function RecipeCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-[14px]">
      <div
        className="skeleton-pulse aspect-ratio-fallback aspect-[4/3] w-full rounded-[14px] bg-[var(--surface-2)]"
        style={{ "--ratio-padding": "75%" } as CSSProperties}
      />
      <div className="pt-3">
        <div className="skeleton-pulse h-4 w-3/4 rounded-full bg-[var(--surface-2)]" />
        <div className="skeleton-pulse mt-2 h-3 w-1/2 rounded-full bg-[var(--surface-2)]" />
      </div>
    </div>
  );
}
