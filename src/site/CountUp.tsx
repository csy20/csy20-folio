"use client";

import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useTransform,
} from "motion/react";
import { useEffect, useRef } from "react";
import { ease, useHydrated, usePrefersReducedMotion } from "./motion";

function formatCount(value: number, decimals: number) {
  return decimals > 0 ? value.toFixed(decimals) : String(Math.round(value));
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
  const inView = useInView(ref, { once: true, margin: "0px 0px -40px 0px" });
  const hydrated = useHydrated();
  const reduced = usePrefersReducedMotion();
  const value = useMotionValue(0);
  const text = useTransform(value, (latest) => formatCount(latest, decimals));
  const finalText = formatCount(to, decimals);

  useEffect(() => {
    if (!active || !inView) return;
    if (reduced) {
      value.set(to);
      return;
    }
    const controls = animate(value, to, { duration: 0.9, ease });
    return () => controls.stop();
  }, [active, inView, reduced, to, value]);

  return (
    <span className="inline-grid tabular-nums">
      <span
        aria-hidden="true"
        className="invisible pointer-events-none col-start-1 row-start-1 select-none"
      >
        {finalText}
      </span>
      <motion.span
        ref={ref}
        className="col-start-1 row-start-1 text-left"
      >
        {hydrated ? text : finalText}
      </motion.span>
    </span>
  );
}
