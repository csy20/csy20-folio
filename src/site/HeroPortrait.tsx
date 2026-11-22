"use client";

import { useRef, type PointerEvent } from "react";
import { portraits } from "@/data/siteContent";
import { usePrefersReducedMotion } from "./motion";

export function HeroPortrait() {
  const reduced = usePrefersReducedMotion();
  const frameRef = useRef<HTMLDivElement>(null);

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (reduced || event.pointerType !== "mouse") return;
    const node = frameRef.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    const nx = (event.clientX - rect.left) / rect.width - 0.5;
    const ny = (event.clientY - rect.top) / rect.height - 0.5;
    node.style.setProperty("--rx", `${(-ny * 9).toFixed(2)}deg`);
    node.style.setProperty("--ry", `${(nx * 9).toFixed(2)}deg`);
    node.style.setProperty("--px", `${((nx + 0.5) * 100).toFixed(1)}%`);
    node.style.setProperty("--py", `${((ny + 0.5) * 100).toFixed(1)}%`);
  };

  const handlePointerLeave = () => {
    const node = frameRef.current;
    if (!node) return;
    node.style.setProperty("--rx", "0deg");
    node.style.setProperty("--ry", "0deg");
  };

  return (
    <div
      ref={frameRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="portrait-tilt relative shrink-0 rounded-[1.15rem]"
    >
      <picture className="block">
        <source
          srcSet="/portrait-twitter-256.webp 1x, /portrait-twitter.webp 2x"
          type="image/webp"
        />
        <img
          src={portraits.twitter.src}
          alt={portraits.twitter.alt}
          width={256}
          height={256}
          fetchPriority="high"
          decoding="async"
          className="h-[5.5rem] w-[5.5rem] rounded-[1.15rem] object-cover sm:h-28 sm:w-28"
        />
      </picture>
      <span
        aria-hidden="true"
        className="portrait-sheen pointer-events-none absolute inset-0 rounded-[1.15rem]"
      />
    </div>
  );
}
