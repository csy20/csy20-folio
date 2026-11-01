"use client";

import { useEffect, useRef, type MouseEvent } from "react";
import {
  caseStudies,
  productSpotlights,
  projects,
  type CaseStudy,
  type ProductSpotlight,
  type Project,
} from "@/data/siteContent";

export const ENGINEERING_NOTE_IDS = [
  "speech-relay",
  "02-os",
  "bytewise",
  "nen",
] as const;

export type EngineeringNoteId = (typeof ENGINEERING_NOTE_IDS)[number];

const titleToNoteId: Readonly<Record<string, EngineeringNoteId>> = {
  "Speech Relay": "speech-relay",
  "02_OS": "02-os",
  Bytewise: "bytewise",
  Nen: "nen",
};

export function getNoteIdForProjectTitle(title: string): EngineeringNoteId | null {
  return titleToNoteId[title] ?? null;
}

export function parseNoteHash(hash: string): EngineeringNoteId | null {
  const prefix = "#notes-";
  if (!hash.startsWith(prefix)) return null;
  const candidate = hash.slice(prefix.length);
  return (ENGINEERING_NOTE_IDS as readonly string[]).includes(candidate)
    ? (candidate as EngineeringNoteId)
    : null;
}

type ResolvedNote =
  | { kind: "case-study"; project: Project; study: CaseStudy }
  | { kind: "spotlight"; project: Project; spotlight: ProductSpotlight };

function resolveNote(id: EngineeringNoteId): ResolvedNote {
  const study = caseStudies.find((item) => item.id === id);
  if (study) {
    const project = projects.find((item) => item.title === study.title);
    if (!project) throw new Error(`Missing project for case study: ${study.title}`);
    return { kind: "case-study", project, study };
  }
  const spotlight = productSpotlights.find((item) => item.id === id);
  if (spotlight) {
    const project = projects.find((item) => item.title === spotlight.title);
    if (!project) throw new Error(`Missing project for spotlight: ${spotlight.title}`);
    return { kind: "spotlight", project, spotlight };
  }
  throw new Error(`Unknown engineering note: ${id}`);
}

function getAdjacentNotes(id: EngineeringNoteId) {
  const index = ENGINEERING_NOTE_IDS.indexOf(id);
  const total = ENGINEERING_NOTE_IDS.length;
  const prevId = ENGINEERING_NOTE_IDS[(index - 1 + total) % total];
  const nextId = ENGINEERING_NOTE_IDS[(index + 1) % total];
  return {
    index,
    total,
    prevId,
    nextId,
    prevTitle: resolveNote(prevId).project.title,
    nextTitle: resolveNote(nextId).project.title,
  };
}

function openModalDialog(dialog: HTMLDialogElement) {
  if (dialog.open) return;
  if (typeof dialog.showModal === "function") {
    try {
      dialog.showModal();
      return;
    } catch {
      // Fallback for test environments without top-layer dialog support.
    }
  }
  dialog.setAttribute("open", "");
}

function closeModalDialog(dialog: HTMLDialogElement) {
  if (!dialog.open) return;
  if (typeof dialog.close === "function") {
    try {
      dialog.close();
      return;
    } catch {
      // Fallback for test environments without dialog.close().
    }
  }
  dialog.removeAttribute("open");
}

export function CaseStudyDialog({
  noteId,
  onClose,
  onNavigate,
}: {
  noteId: EngineeringNoteId | null;
  onClose: () => void;
  onNavigate?: (id: EngineeringNoteId) => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (noteId) {
      openModalDialog(dialog);
      dialog.scrollTop = 0;
    } else {
      closeModalDialog(dialog);
    }
  }, [noteId]);

  useEffect(() => {
    if (!noteId || !onNavigate) return;
    const { prevId, nextId } = getAdjacentNotes(noteId);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
        return;
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        onNavigate(prevId);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        onNavigate(nextId);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [noteId, onNavigate]);

  const resolved = noteId ? resolveNote(noteId) : null;
  const adjacent = noteId ? getAdjacentNotes(noteId) : null;

  // Fallback light-dismiss for browsers without `<dialog closedby="any">` (e.g. Safari).
  const handleBackdropClick = (event: MouseEvent<HTMLDialogElement>) => {
    const dialog = dialogRef.current;
    if (!dialog || event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    const clickedOutside =
      rect.width === 0 ||
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom;
    if (clickedOutside) onClose();
  };

  return (
    <dialog
      ref={dialogRef}
      closedby="any"
      aria-labelledby={resolved ? "case-study-dialog-title" : undefined}
      onClose={onClose}
      onClick={handleBackdropClick}
      className="folio-dialog m-auto max-h-[90dvh] w-[min(36rem,calc(100vw-2rem))] overflow-y-auto rounded-2xl shadow-2xl max-sm:mb-0 max-sm:mt-auto max-sm:max-h-[88dvh] max-sm:w-full max-sm:max-w-none max-sm:rounded-t-2xl max-sm:rounded-b-none"
    >
      {resolved ? (
        <div className="p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:px-6 sm:py-5">
          <div
            aria-hidden="true"
            className="mx-auto mb-3.5 h-1 w-9 rounded-full bg-[var(--line)] sm:hidden"
          />
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-mono text-[11px] tracking-[0.08em] text-[var(--ink-faint)] uppercase">
                {resolved.kind === "case-study"
                  ? resolved.study.category
                  : resolved.project.eyebrow}
              </p>
              <h2
                id="case-study-dialog-title"
                className="mt-1 text-[1.45rem] font-medium tracking-[-0.03em] text-[var(--ink)]"
              >
                {resolved.project.title}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close engineering notes"
              className="folio-btn cursor-pointer rounded-lg border border-[var(--line)] bg-[var(--card)] px-2.5 py-1 font-mono text-[11px] text-[var(--ink-faint)] transition-colors hover:text-[var(--ink)]"
            >
              <span className="[@media(pointer:coarse)]:hidden">Esc</span>
              <span className="hidden [@media(pointer:coarse)]:inline">
                × Close
              </span>
            </button>
          </div>

          <ul
            aria-label="Technologies"
            className="mt-4 flex flex-wrap gap-1.5 font-mono text-[11px] text-[var(--ink-soft)]"
          >
            {resolved.project.tags.map((tag) => (
              <li
                key={tag}
                className="rounded-md border border-[var(--line)] bg-[var(--logo-well)] px-2 py-0.5"
              >
                {tag}
              </li>
            ))}
          </ul>

          {resolved.kind === "case-study" ? (
            <dl className="mt-4 space-y-3.5 text-[14px] leading-6">
              <div>
                <dt className="font-mono text-[11px] tracking-[0.08em] text-[var(--ink-faint)] uppercase">
                  Overview
                </dt>
                <dd className="mt-1 text-[var(--ink-soft)]">{resolved.study.overview}</dd>
              </div>
              <div>
                <dt className="font-mono text-[11px] tracking-[0.08em] text-[var(--ink-faint)] uppercase">
                  Architectural decision
                </dt>
                <dd className="mt-1 text-[var(--ink-soft)]">{resolved.study.decision}</dd>
              </div>
              <div className="rounded-xl border border-[var(--line)] bg-[var(--logo-well)] p-3.5">
                <dt className="font-mono text-[11px] tracking-[0.08em] text-[var(--accent)] uppercase">
                  Measured outcome
                </dt>
                <dd className="mt-1 font-medium text-[var(--ink)]">
                  {resolved.study.outcome}
                </dd>
              </div>
              <div>
                <dt className="font-mono text-[11px] tracking-[0.08em] text-[var(--ink-faint)] uppercase">
                  Implementation detail
                </dt>
                <dd className="mt-1 text-[var(--ink-soft)]">{resolved.study.detail}</dd>
              </div>
            </dl>
          ) : (
            <div className="mt-5 space-y-4 text-[14px] leading-6">
              <p className="text-[1.15rem] leading-snug font-medium tracking-[-0.02em] text-[var(--ink)]">
                {resolved.spotlight.coverLine.replace("\n", " ")}
              </p>
              <p className="text-[var(--ink-soft)]">{resolved.spotlight.overview}</p>
              <div>
                <h3 className="font-mono text-[11px] tracking-[0.08em] text-[var(--ink-faint)] uppercase">
                  Product guarantees
                </h3>
                <ul className="mt-2 space-y-1.5 text-[var(--ink-soft)]">
                  {resolved.spotlight.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <span
                        aria-hidden="true"
                        className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]"
                      />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--line)] pt-3.5">
            {resolved.project.releaseNote ? (
              <p className="max-w-[38ch] font-mono text-[11px] leading-4 text-[var(--ink-faint)]">
                {resolved.project.releaseNote}
              </p>
            ) : (
              <span />
            )}
            <div className="flex flex-wrap gap-3">
              {resolved.project.links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="page-link text-[13px] font-medium text-[var(--ink)] underline-offset-4 hover:underline"
                >
                  {link.label} ↗
                </a>
              ))}
            </div>
          </div>

          {adjacent && onNavigate ? (
            <nav
              aria-label="Engineering notes pagination"
              className="mt-3.5 flex items-center justify-between gap-2 border-t border-[var(--line)] pt-3 font-mono text-[12px]"
            >
              <button
                type="button"
                onClick={() => onNavigate(adjacent.prevId)}
                aria-label={`Previous note: ${adjacent.prevTitle}`}
                className="folio-btn cursor-pointer text-[var(--ink-soft)] transition-colors hover:text-[var(--ink)]"
              >
                ← {adjacent.prevTitle}
              </button>
              <span className="text-[11px] tabular-nums text-[var(--ink-faint)]">
                {adjacent.index + 1} / {adjacent.total}
              </span>
              <button
                type="button"
                onClick={() => onNavigate(adjacent.nextId)}
                aria-label={`Next note: ${adjacent.nextTitle}`}
                className="folio-btn cursor-pointer text-[var(--ink-soft)] transition-colors hover:text-[var(--ink)]"
              >
                {adjacent.nextTitle} →
              </button>
            </nav>
          ) : null}
        </div>
      ) : null}
    </dialog>
  );
}
