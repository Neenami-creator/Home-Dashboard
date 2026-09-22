"use client";

import { motion, type HTMLMotionProps } from "motion/react";
import type { ReactNode } from "react";

type Size = "sm" | "md" | "lg" | "control" | "play";

const SIZES: Record<Size, string> = {
  sm: "h-9 w-9",
  md: "h-12 w-12",
  lg: "h-16 w-16",
  // Spotify's secondary transport controls (44px) and the primary play/pause
  // button (58px) per the redesign's touch-target spec - additive so other
  // screens' existing sm/md/lg usage is unaffected.
  control: "h-11 w-11",
  play: "h-[58px] w-[58px]",
};

export function IconButton({
  children,
  size = "md",
  variant = "ghost",
  accent,
  className = "",
  disabled,
  ...props
}: {
  children: ReactNode;
  size?: Size;
  variant?: "ghost" | "solid";
  accent?: string;
} & HTMLMotionProps<"button">) {
  const base = "flex items-center justify-center rounded-full disabled:opacity-40 disabled:pointer-events-none";
  const style =
    variant === "solid"
      ? { backgroundColor: accent ?? "var(--foreground)", color: "#08090b" }
      : {
          borderWidth: 1,
          borderColor: "var(--border)",
          color: "var(--foreground)",
        };

  return (
    <motion.button
      type="button"
      disabled={disabled}
      whileTap={disabled ? undefined : { scale: 0.9 }}
      whileHover={disabled ? undefined : { scale: 1.05 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className={`${base} ${SIZES[size]} ${variant === "ghost" ? "hover:bg-[var(--surface-hover)]" : "hover:brightness-110"} ${className}`}
      style={style}
      {...props}
    >
      {children}
    </motion.button>
  );
}
