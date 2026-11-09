"use client";

import { useEffect, useRef, useState } from "react";
import { useHydrated, usePrefersReducedMotion } from "./motion";

function formatCount(value: number, decimals: number) {
  return decimals > 0 ? value.toFixed(decimals) : String(Math.round(value));
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export function CountUp({
  to,
  decimals = 0,
  active = true,
}: {
  to: number;
  decimals?: number;
  active?: boolean;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const hydrated = useHydrated();
  const reduced = usePrefersReducedMotion();
  const finalText = formatCount(to, decimals);
  const [inView, setInView] = useState(
    () => typeof window !== "undefined" && typeof IntersectionObserver === "undefined",
  );
  const [display, setDisplay] = useState(() => formatCount(0, decimals));

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -40px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!active || !inView || reduced || typeof window === "undefined") return;

    const durationMs = 900;
    const start = performance.now();
    let rafId = 0;

    const tick = (now: number) => {
      const progress = Math.min(1, Math.max(0, (now - start) / durationMs));
      const eased = easeOutCubic(progress);
      setDisplay(formatCount(to * eased, decimals));
      if (progress < 1) {
        rafId = window.requestAnimationFrame(tick);
      }
    };

    rafId = window.requestAnimationFrame(tick);
    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, [active, decimals, inView, reduced, to]);

  return (
    <span className="inline-grid tabular-nums">
      <span
        aria-hidden="true"
        className="invisible pointer-events-none col-start-1 row-start-1 select-none"
      >
        {finalText}
      </span>
      <span ref={ref} className="col-start-1 row-start-1 text-left">
        {hydrated ? (reduced ? finalText : display) : finalText}
      </span>
    </span>
  );
}
