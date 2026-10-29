"use client";

import { motion, useScroll, useSpring } from "motion/react";
import { usePrefersReducedMotion } from "./Opening";

export function ScrollProgress() {
  const reduced = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 28, mass: 0.3 });

  if (reduced) return null;

  return (
    <motion.div
      aria-hidden="true"
      className="fixed inset-x-0 top-0 z-[60] h-[2px] origin-left bg-[var(--accent)]"
      style={{ scaleX }}
    />
  );
}
