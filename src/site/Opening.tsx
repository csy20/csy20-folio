"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { portraits, profile } from "@/data/siteContent";
import { subscribeNoop, usePrefersReducedMotion } from "./motion";

export { usePrefersReducedMotion } from "./motion";

const hops = ["mic", "vad", "asr", "out"];

export const OPENING_SESSION_KEY = "csy20-opened";
export const OPENING_HOLD_MS = 620;
export const OPENING_LEAVE_MS = 280;

function openingSeenSnapshot(): boolean {
  try {
    return window.sessionStorage.getItem(OPENING_SESSION_KEY) === "1";
  } catch {
    return false;
  }
}

export function useHasSeenOpening() {
  return useSyncExternalStore(
    subscribeNoop,
    openingSeenSnapshot,
    () => false,
  );
}

function markOpeningSeen() {
  try {
    window.sessionStorage.setItem(OPENING_SESSION_KEY, "1");
  } catch {
    // Ignore restricted sessionStorage environments.
  }
}

function clearOpeningClass() {
  document.documentElement.classList.remove("is-opening");
}

export function Opening({ onLeave }: { onLeave: () => void }) {
  const reduced = usePrefersReducedMotion();
  const seen = useHasSeenOpening();
  const [visible, setVisible] = useState(true);
  const [leaving, setLeaving] = useState(false);
  const skipRef = useRef<() => void>(() => {});

  useEffect(() => {
    if (reduced || openingSeenSnapshot()) {
      clearOpeningClass();
      onLeave();
      return;
    }

    let hideTimer = 0;
    let settled = false;

    const finish = (immediate: boolean) => {
      if (settled && !immediate) return;
      window.clearTimeout(leaveTimer);
      window.clearTimeout(hideTimer);
      clearOpeningClass();
      markOpeningSeen();
      if (!settled) {
        onLeave();
      }
      settled = true;
      if (immediate) {
        setVisible(false);
        return;
      }
      setLeaving(true);
      hideTimer = window.setTimeout(() => setVisible(false), OPENING_LEAVE_MS);
    };

    const leaveTimer = window.setTimeout(() => finish(false), OPENING_HOLD_MS);

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" || event.key === "Enter") finish(true);
    };

    skipRef.current = () => finish(true);
    window.addEventListener("keydown", onKey);

    return () => {
      settled = true;
      window.clearTimeout(leaveTimer);
      window.clearTimeout(hideTimer);
      window.removeEventListener("keydown", onKey);
    };
  }, [onLeave, reduced]);

  if (reduced || (seen && !leaving) || !visible) return null;

  return (
    <div
      className="opening-curtain fixed inset-0 z-[70] flex cursor-pointer items-center justify-center bg-[var(--page-bg)] px-6 text-[var(--ink)]"
      aria-hidden="true"
      style={{
        transform: leaving ? "translateY(-100%)" : "translateY(0%)",
        transition: leaving
          ? `transform ${OPENING_LEAVE_MS}ms cubic-bezier(0.76, 0, 0.24, 1)`
          : undefined,
      }}
      onClick={() => skipRef.current()}
    >
      <div className="flex flex-col items-center text-center">
        <div>
          <picture>
            <source
              srcSet="/portrait-twitter-256.webp 1x, /portrait-twitter.webp 2x"
              type="image/webp"
            />
            <img
              src={portraits.twitter.src}
              alt=""
              width={256}
              height={256}
              decoding="async"
              className="h-28 w-28 rounded-[1.35rem] object-cover sm:h-36 sm:w-36"
            />
          </picture>
        </div>
        <div className="mt-6 h-px w-28 origin-center bg-[var(--ink)] opacity-35" />
        <p className="mt-5 overflow-hidden text-[2.2rem] leading-[0.96] font-medium tracking-[-0.045em] sm:text-[3.25rem]">
          <span className="block">{profile.name}</span>
        </p>
        <p className="mt-3 text-[17px] text-[var(--ink-soft)]">{profile.role}</p>
        <div className="mt-8 flex items-center gap-2 font-mono text-[11px] tabular-nums text-[var(--ink-faint)]">
          {hops.map((hop, index) => (
            <div
              key={hop}
              className="opening-hop flex items-center gap-2"
              style={{ animationDelay: `${140 + index * 90}ms` }}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--ink)]" />
              <span>{hop}</span>
              {index < hops.length - 1 && (
                <span className="h-px w-5 origin-left bg-[var(--ink)] opacity-40" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
