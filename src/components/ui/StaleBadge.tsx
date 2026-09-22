import { WifiOff } from "lucide-react";
import { formatRelativeTime } from "@/lib/cache";

export function StaleBadge({ savedAt }: { savedAt: number }) {
  return (
    <span className="flex items-center gap-1.5 rounded-[12px] border border-[var(--border)] bg-[var(--surface-2)] px-3 py-1.5 text-[12px] text-[var(--text-secondary)] shadow-[inset_0_1px_0_var(--inset-highlight)]">
      <WifiOff size={12} className="text-[var(--text-tertiary)]" />
      Showing last known state · updated {formatRelativeTime(savedAt)}
    </span>
  );
}
