export function Toggle({
  on,
  onChange,
  accent,
  disabled,
  ariaLabel,
}: {
  on: boolean;
  onChange: (on: boolean) => void;
  accent: string;
  disabled?: boolean;
  ariaLabel: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => onChange(!on)}
      className="relative h-9 w-16 shrink-0 rounded-full border transition disabled:opacity-40"
      style={{
        borderColor: on ? accent : "var(--border-strong)",
        backgroundColor: on ? `color-mix(in srgb, ${accent} 85%, transparent)` : "var(--surface)",
      }}
    >
      <span
        className="absolute top-1 h-6 w-6 rounded-full bg-[#08090b] shadow transition-transform"
        style={{ transform: on ? "translateX(30px)" : "translateX(4px)" }}
      />
    </button>
  );
}
