"use client";

import {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { SocialDock } from "@/dock/SocialDock";
import { SoundToggle } from "@/dock/SoundToggle";
import { SoundContext } from "@/dock/useSound";
import {
  CaseStudyDialog,
  parseNoteHash,
  type EngineeringNoteId,
} from "./CaseStudyDialog";
import { Opening, useHasSeenOpening } from "./Opening";
import { PageTelemetry } from "./PageTelemetry";
import {
  subscribeNoop,
  useHydrated,
  usePrefersReducedMotion,
} from "./motion";

export const noteHashEvent = "csy20-note-hash";

function subscribeToNoteHash(onChange: () => void) {
  window.addEventListener("hashchange", onChange);
  window.addEventListener(noteHashEvent, onChange);
  return () => {
    window.removeEventListener("hashchange", onChange);
    window.removeEventListener(noteHashEvent, onChange);
  };
}

function readNoteHash(): EngineeringNoteId | null {
  return parseNoteHash(window.location.hash);
}

export function openEngineeringNote(id: EngineeringNoteId) {
  window.history.replaceState(null, "", `#notes-${id}`);
  window.dispatchEvent(new Event(noteHashEvent));
}

function canUseClipboard(): boolean {
  return (
    typeof navigator !== "undefined" &&
    typeof navigator.clipboard?.writeText === "function"
  );
}

export function CopyEmailButton({ email }: { email: string }) {
  const supported = useSyncExternalStore(
    subscribeNoop,
    canUseClipboard,
    () => false,
  );
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<number>(0);
  const sound = useContext(SoundContext);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  if (!supported) return null;

  const handleCopy = async () => {
    sound?.playDockTick();
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      if (timerRef.current) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch {
      // Clipboard write may fail if permission is denied.
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? "Email address copied" : "Copy email address"}
      className="folio-btn inline-flex cursor-pointer items-center rounded-lg border border-[var(--line)] bg-[var(--card)] px-2.5 py-1 font-mono text-[11px] text-[var(--ink-soft)] transition-colors hover:border-[var(--accent)] hover:text-[var(--ink)]"
    >
      <span aria-live="polite">{copied ? "Copied ✓" : "Copy"}</span>
    </button>
  );
}

export function OpenNoteButton({ noteId }: { noteId: EngineeringNoteId }) {
  const sound = useContext(SoundContext);

  return (
    <button
      type="button"
      onClick={() => {
        sound?.playDockTick();
        openEngineeringNote(noteId);
      }}
      className="folio-btn cursor-pointer text-[12px] font-medium text-[var(--accent)] underline-offset-4 hover:underline"
    >
      Engineering notes
    </button>
  );
}

export function ProjectCardShell({
  id,
  className,
  children,
}: {
  id: string;
  className: string;
  children: ReactNode;
} & Omit<HTMLAttributes<HTMLElement>, "id" | "className" | "children">) {
  return (
    <article
      id={id}
      className={className}
      onPointerMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        event.currentTarget.style.setProperty(
          "--mx",
          `${event.clientX - rect.left}px`,
        );
        event.currentTarget.style.setProperty(
          "--my",
          `${event.clientY - rect.top}px`,
        );
      }}
    >
      {children}
    </article>
  );
}

export function FooterClientControls() {
  const mounted = useHydrated();
  if (!mounted) return null;
  return (
    <>
      <SoundToggle />
      <PageTelemetry />
    </>
  );
}

export function InteractiveOverlays() {
  const mounted = useHydrated();
  const reducedMotion = usePrefersReducedMotion();
  const seenOpening = useHasSeenOpening();
  const [opened, setOpened] = useState(false);
  const activeNote = useSyncExternalStore(
    subscribeToNoteHash,
    readNoteHash,
    () => null,
  );
  const play = reducedMotion || seenOpening || opened;

  const onLeave = useCallback(() => {
    document.documentElement.classList.remove("is-opening");
    setOpened(true);
  }, []);

  const closeNote = useCallback(() => {
    if (parseNoteHash(window.location.hash)) {
      window.history.replaceState(
        null,
        "",
        window.location.pathname + window.location.search,
      );
      window.dispatchEvent(new Event(noteHashEvent));
    }
  }, []);

  return (
    <>
      <Opening onLeave={onLeave} />
      {mounted ? (
        <>
          <CaseStudyDialog
            noteId={activeNote}
            onClose={closeNote}
            onNavigate={openEngineeringNote}
          />
          {play ? <SocialDock /> : null}
        </>
      ) : null}
    </>
  );
}
