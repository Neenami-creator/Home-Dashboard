import { WifiOff } from "lucide-react";
import { formatRelativeTime } from "@/lib/cache";

export function StaleBadge({ savedAt }: { savedAt: number }) {
  return (
    <span className="flex items-center gap-1.5 rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-1 text-xs text-amber-200">
      <WifiOff size={12} />
      Showing last known state · updated {formatRelativeTime(savedAt)}
    </span>
  );
}
