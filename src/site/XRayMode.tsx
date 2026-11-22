"use client";

import { useContext, useEffect, useState } from "react";
import { SoundContext } from "@/dock/useSound";

export function XRayToggle() {
  const [locked, setLocked] = useState(false);
  const [peeking, setPeeking] = useState(false);
  const sound = useContext(SoundContext);
  const active = locked || peeking;

  useEffect(() => {
    const root = document.documentElement;
    if (active) root.setAttribute("data-xray", "on");
    else root.removeAttribute("data-xray");
    return () => {
      root.removeAttribute("data-xray");
    };
  }, [active]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Alt" && !event.repeat && !event.ctrlKey && !event.metaKey) {
        setPeeking(true);
      }
      if (event.key === "Escape") {
        setLocked(false);
        setPeeking(false);
      }
    };
    const onKeyUp = (event: KeyboardEvent) => {
      if (event.key === "Alt") setPeeking(false);
    };
    const onBlur = () => setPeeking(false);

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
    };
  }, []);

  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={active ? "Disable architecture X-Ray blueprint" : "Enable architecture X-Ray blueprint"}
      title="Architecture blueprint overlay (or hold Alt)"
      onClick={() => {
        const next = !locked;
        if (sound?.playTone) {
          sound.playTone({ kind: next ? "fresh" : "stale" });
        } else {
          sound?.playDockTick();
        }
        setLocked(next);
      }}
      className={`folio-btn inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 py-1 font-mono text-[11.5px] transition-colors ${
        active
          ? "border-[var(--accent)] bg-[color-mix(in_srgb,var(--accent)_14%,var(--card))] text-[var(--ink)]"
          : "border-[var(--line)] bg-[var(--card)] text-[var(--ink-soft)] hover:border-[var(--accent)] hover:text-[var(--ink)]"
      }`}
    >
      <svg
        aria-hidden="true"
        width="12"
        height="12"
        viewBox="0 0 14 14"
        fill="none"
        className={active ? "text-[var(--accent)]" : "text-[var(--ink-faint)]"}
      >
        <rect
          x="1.5"
          y="1.5"
          width="11"
          height="11"
          rx="2"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeDasharray="2 1.5"
        />
        <path
          d="M4.5 7h5M7 4.5v5"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </svg>
      <span>{active ? "X-Ray: on" : "X-Ray"}</span>
    </button>
  );
}
