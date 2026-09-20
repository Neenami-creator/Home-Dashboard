"use client";

import { useEffect, useState } from "react";

export function Clock({ className = "" }: { className?: string }) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    // Avoids a server/client hydration mismatch on the initial render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNow(new Date());
    const interval = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(interval);
  }, []);

  if (!now) return <div className={className} />;

  return (
    <div className={className}>
      <p className="font-display text-right text-lg font-medium tabular-nums leading-tight">
        {now.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}
      </p>
      <p className="text-right text-xs text-[var(--text-tertiary)]">
        {now.toLocaleDateString(undefined, { weekday: "long" })} ·{" "}
        {now.toLocaleDateString(undefined, { day: "numeric", month: "long" })}
      </p>
    </div>
  );
}
