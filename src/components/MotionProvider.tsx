"use client";

import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";

// Every Motion-driven animation in the app (grid stagger, tile transitions,
// tap springs, the Toggle knob, AnimatePresence swaps) is scoped under this
// so a device/OS-level "reduce motion" preference is honoured everywhere at
// once, rather than needing useReducedMotion() threaded through each
// component individually.
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
