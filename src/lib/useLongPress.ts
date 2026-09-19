"use client";

import { useRef } from "react";

/**
 * Fires `onLongPress` after holding a pointer down for `ms`. The consumer
 * is responsible for checking `wasLongPress()` inside its own click handler
 * and cancelling the normal tap action (e.g. `preventDefault`) when it
 * returns true, since a browser still fires `click` after `pointerup`.
 */
export function useLongPress(onLongPress: () => void, ms = 550) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const triggered = useRef(false);

  function start() {
    triggered.current = false;
    timer.current = setTimeout(() => {
      triggered.current = true;
      onLongPress();
    }, ms);
  }

  function cancel() {
    if (timer.current) clearTimeout(timer.current);
  }

  return {
    onPointerDown: start,
    onPointerUp: cancel,
    onPointerLeave: cancel,
    onPointerCancel: cancel,
    wasLongPress: () => triggered.current,
  };
}
