"use client";

import { useSyncExternalStore } from "react";

export const ease = [0.22, 1, 0.36, 1] as const;

export function subscribeNoop() {
  return () => {};
}

export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );
}

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}

function subscribeToReducedMotion(onChange: () => void) {
  try {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    media.addEventListener?.("change", onChange);
    return () => media.removeEventListener?.("change", onChange);
  } catch {
    return () => {};
  }
}

export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeToReducedMotion,
    prefersReducedMotion,
    () => false,
  );
}
