"use client";

import { motion } from "motion/react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { portraits, profile } from "@/data/siteContent";

const ease = [0.22, 1, 0.36, 1] as const;
const hops = ["mic", "vad", "asr", "out"];

export const OPENING_SESSION_KEY = "csy20-opened";

function subscribeToMotion(onChange: () => void) {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

function motionSnapshot() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function usePrefersReducedMotion() {
  return useSyncExternalStore(subscribeToMotion, motionSnapshot, () => false);
}

function subscribeToOpeningSession() {
  return () => {};
}

function openingSeenSnapshot(): boolean {
  try {
    return window.sessionStorage.getItem(OPENING_SESSION_KEY) === "1";
  } catch {
    return false;
  }
}

export function useHasSeenOpening() {
  return useSyncExternalStore(
    subscribeToOpeningSession,
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
      hideTimer = window.setTimeout(() => setVisible(false), 450);
    };

    const leaveTimer = window.setTimeout(() => finish(false), 1400);

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
    <motion.div
      className="opening-curtain fixed inset-0 z-[70] flex cursor-pointer items-center justify-center bg-[var(--page-bg)] px-6 text-[var(--ink)]"
      aria-hidden="true"
      initial={{ y: 0 }}
      animate={{ y: leaving ? "-100%" : "0%" }}
      transition={{
        duration: leaving ? 0.45 : 0,
        ease: [0.76, 0, 0.24, 1],
      }}
      onClick={() => skipRef.current()}
    >
      <div className="flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease }}
        >
          <picture>
            <source srcSet="/portrait-twitter.webp" type="image/webp" />
            <img
              src={portraits.twitter.src}
              alt=""
              width={736}
              height={736}
              className="h-28 w-28 rounded-[1.35rem] object-cover sm:h-36 sm:w-36"
            />
          </picture>
        </motion.div>
        <motion.div
          className="mt-6 h-px w-28 origin-center bg-[var(--ink)] opacity-35"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.45, delay: 0.18, ease }}
        />
        <p className="mt-5 overflow-hidden text-[2.2rem] leading-[0.96] font-medium tracking-[-0.045em] sm:text-[3.25rem]">
          <motion.span
            className="block"
            initial={{ y: "110%" }}
            animate={{ y: "0%" }}
            transition={{ duration: 0.55, delay: 0.34, ease }}
          >
            {profile.name}
          </motion.span>
        </p>
        <motion.p
          className="mt-3 text-[17px] text-[var(--ink-soft)]"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.55, ease }}
        >
          {profile.role}
        </motion.p>
        <div className="mt-8 flex items-center gap-2 font-mono text-[11px] tabular-nums text-[var(--ink-faint)]">
          {hops.map((hop, index) => (
            <motion.div
              key={hop}
              className="flex items-center gap-2"
              initial={{ opacity: 0.25 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.25, delay: 0.5 + index * 0.18 }}
            >
              <motion.span
                className="h-1.5 w-1.5 rounded-full bg-[var(--ink)]"
                initial={{ scale: 0.6 }}
                animate={{ scale: [0.6, 1.8, 1] }}
                transition={{ duration: 0.4, delay: 0.5 + index * 0.18 }}
              />
              <span>{hop}</span>
              {index < hops.length - 1 && (
                <motion.span
                  className="h-px w-5 origin-left bg-[var(--ink)] opacity-40"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.18, delay: 0.6 + index * 0.18 }}
                />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
