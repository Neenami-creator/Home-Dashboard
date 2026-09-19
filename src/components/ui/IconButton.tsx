import type { ButtonHTMLAttributes, ReactNode } from "react";

type Size = "sm" | "md" | "lg";

const SIZES: Record<Size, string> = {
  sm: "h-9 w-9",
  md: "h-12 w-12",
  lg: "h-16 w-16",
};

export function IconButton({
  children,
  size = "md",
  variant = "ghost",
  accent,
  className = "",
  ...props
}: {
  children: ReactNode;
  size?: Size;
  variant?: "ghost" | "solid";
  accent?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  const base = "flex items-center justify-center rounded-full transition disabled:opacity-40 disabled:pointer-events-none active:scale-95";
  const style =
    variant === "solid"
      ? { backgroundColor: accent ?? "var(--foreground)", color: "#08090b" }
      : {
          borderWidth: 1,
          borderColor: "var(--border)",
          color: "var(--foreground)",
        };

  return (
    <button
      type="button"
      className={`${base} ${SIZES[size]} ${variant === "ghost" ? "hover:bg-[var(--surface-hover)]" : "hover:brightness-110"} ${className}`}
      style={style}
      {...props}
    >
      {children}
    </button>
  );
}
