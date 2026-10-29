"use client";

import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent,
} from "react";
import { config } from "@/config";
import {
  formatContributionDate,
  getContributionDate,
  mergedContributions,
  type Contribution,
} from "@/data/contributions";
import { projects, resumeUrl } from "@/data/siteContent";
import { SoundContext } from "@/dock/useSound";
import { ThemeContext } from "@/dock/useTheme";
import {
  getNoteIdForProjectTitle,
  type EngineeringNoteId,
} from "./CaseStudyDialog";
import { usePrefersReducedMotion } from "./Opening";
import { SPEECH_TRACE_EVENT, type LatencyLabMode } from "./PipelineSchematic";

export function getContributionDomId(
  record: Pick<Contribution, "repository" | "number">,
) {
  return `pr-${record.repository.replace(/[^a-zA-Z0-9_-]/g, "-")}-${record.number}`;
}

const projectAnchors: Readonly<Record<string, string>> = {
  "02_OS": "02-os",
  Bytewise: "bytewise",
  Nen: "nen",
  "Speech Relay": "speech-relay",
  "Speech Relay Rust": "speech-relay-rust",
  "MediaPipe AI": "mediapipe-ai",
  "Router Agent": "router-agent",
  Warrant: "warrant",
};

type CommandAction =
  | { kind: "speech-lab"; mode: LatencyLabMode }
  | { kind: "copy-email" }
  | { kind: "open-resume" }
  | { kind: "toggle-theme" }
  | { kind: "toggle-sound" }
  | { kind: "scroll"; targetId: string }
  | { kind: "open-note"; noteId: EngineeringNoteId }
  | { kind: "open-pr"; record: Contribution };

type CommandItem = {
  id: string;
  group: "Actions" | "Projects & Notes" | "Merged Pull Requests";
  label: string;
  detail: string;
  keywords: string;
  action: CommandAction;
};

function openDialog(dialog: HTMLDialogElement) {
  if (dialog.open) return;
  if (typeof dialog.showModal === "function") {
    try {
      dialog.showModal();
      return;
    } catch {
      // Fallback for jsdom without top-layer dialog support.
    }
  }
  dialog.setAttribute("open", "");
}

function closeDialog(dialog: HTMLDialogElement) {
  if (!dialog.open) return;
  if (typeof dialog.close === "function") {
    try {
      dialog.close();
      return;
    } catch {
      // Fallback for jsdom without dialog.close().
    }
  }
  dialog.removeAttribute("open");
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    target.isContentEditable
  );
}

export function CommandPalette({
  open,
  onOpenChange,
  onOpenNote,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenNote: (id: EngineeringNoteId) => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const reduced = usePrefersReducedMotion();
  const sound = useContext(SoundContext);
  const themeCtx = useContext(ThemeContext);

  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const scrollBehavior: ScrollBehavior = reduced ? "auto" : "smooth";

  const closePalette = useCallback(() => {
    setQuery("");
    setActiveIndex(0);
    setCopied(false);
    onOpenChange(false);
  }, [onOpenChange]);

  const items = useMemo<CommandItem[]>(() => {
    const nextThemeLabel =
      themeCtx?.theme === "light"
        ? "Switch to dark theme"
        : "Switch to light theme";
    const soundLabel =
      sound?.soundEnabled === false
        ? "Unmute tactile sound"
        : "Mute tactile sound";

    const actionItems: CommandItem[] = [
      {
        id: "act-trace",
        group: "Actions",
        label: "Run Speech Relay pipeline trace",
        detail: "2,505 ms · 2×",
        keywords: "speech relay trace latency benchmark pipeline webrtc",
        action: { kind: "speech-lab", mode: "trace" },
      },
      {
        id: "act-vad",
        group: "Actions",
        label: "Run Silero-VAD vs Fixed-window race",
        detail: "-23.6% · 2×",
        keywords: "vad silero race benchmark 3597 4708 latency",
        action: { kind: "speech-lab", mode: "vad-race" },
      },
      {
        id: "act-email",
        group: "Actions",
        label: copied ? `Copied ${config.email}` : "Copy email address",
        detail: copied ? "Copied!" : config.email,
        keywords: `email contact mail copy ${config.email}`,
        action: { kind: "copy-email" },
      },
      {
        id: "act-resume",
        group: "Actions",
        label: "Open Resume (PDF)",
        detail: "csy20_resume.pdf",
        keywords: "resume cv pdf download",
        action: { kind: "open-resume" },
      },
      {
        id: "act-theme",
        group: "Actions",
        label: nextThemeLabel,
        detail: themeCtx?.theme === "light" ? "Dark" : "Light",
        keywords: "theme dark light mode toggle appearance",
        action: { kind: "toggle-theme" },
      },
      {
        id: "act-sound",
        group: "Actions",
        label: soundLabel,
        detail: sound?.soundEnabled === false ? "Off → On" : "On → Off",
        keywords: "sound audio mute unmute dock tick",
        action: { kind: "toggle-sound" },
      },
    ];

    const projectItems: CommandItem[] = [];
    for (const project of projects) {
      const noteId = getNoteIdForProjectTitle(project.title);
      const anchor = projectAnchors[project.title];
      if (anchor) {
        projectItems.push({
          id: `proj-${anchor}`,
          group: "Projects & Notes",
          label: project.title,
          detail: project.eyebrow,
          keywords: `${project.title} ${project.eyebrow} ${project.tags.join(" ")}`,
          action: { kind: "scroll", targetId: anchor },
        });
      }
      if (noteId) {
        projectItems.push({
          id: `note-${noteId}`,
          group: "Projects & Notes",
          label: `Engineering notes: ${project.title}`,
          detail: "Case study",
          keywords: `notes case study architecture decision ${project.title} ${project.tags.join(" ")}`,
          action: { kind: "open-note", noteId },
        });
      }
    }

    projectItems.push(
      {
        id: "sec-open-source",
        group: "Projects & Notes",
        label: "Jump to Open source",
        detail: `${mergedContributions.length} merged PRs`,
        keywords: "open source pull requests github upstream",
        action: { kind: "scroll", targetId: "open-source" },
      },
      {
        id: "sec-contact",
        group: "Projects & Notes",
        label: "Jump to Contact",
        detail: "Links & availability",
        keywords: "contact social github linkedin x threads youtube",
        action: { kind: "scroll", targetId: "contact" },
      },
    );

    const prItems: CommandItem[] = mergedContributions.map((record) => ({
      id: `cmd-${getContributionDomId(record)}`,
      group: "Merged Pull Requests",
      label: record.title,
      detail: `${record.repository}#${record.number}`,
      keywords: `${record.repository} #${record.number} ${record.number} ${record.title} ${formatContributionDate(getContributionDate(record))} pr pull request`,
      action: { kind: "open-pr", record },
    }));

    return [...actionItems, ...projectItems, ...prItems];
  }, [copied, sound?.soundEnabled, themeCtx?.theme]);

  const filtered = useMemo(() => {
    const tokens = query
      .toLowerCase()
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    if (tokens.length === 0) return items;
    return items.filter((item) => {
      const haystack = `${item.label} ${item.detail} ${item.keywords}`.toLowerCase();
      return tokens.every((token) => haystack.includes(token));
    });
  }, [items, query]);

  const clampedIndex =
    filtered.length === 0 ? -1 : Math.min(activeIndex, filtered.length - 1);

  useEffect(() => {
    const onGlobalKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        if (open) closePalette();
        else onOpenChange(true);
        return;
      }
      if (
        !open &&
        event.key === "/" &&
        !event.metaKey &&
        !event.ctrlKey &&
        !event.altKey &&
        !isEditableTarget(event.target) &&
        !document.querySelector("dialog[open]")
      ) {
        event.preventDefault();
        onOpenChange(true);
      }
    };
    window.addEventListener("keydown", onGlobalKeyDown);
    return () => window.removeEventListener("keydown", onGlobalKeyDown);
  }, [closePalette, onOpenChange, open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open) {
      openDialog(dialog);
      window.requestAnimationFrame(() => inputRef.current?.focus());
    } else {
      closeDialog(dialog);
    }
  }, [open]);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => {
      closePalette();
    }, 550);
    return () => window.clearTimeout(timer);
  }, [closePalette, copied]);

  const executeItem = (item: CommandItem | undefined) => {
    if (!item) return;
    sound?.playDockTick();
    const { action } = item;

    switch (action.kind) {
      case "speech-lab": {
        closePalette();
        window.requestAnimationFrame(() => {
          document
            .getElementById("speech-relay")
            ?.scrollIntoView({ behavior: scrollBehavior, block: "center" });
          window.dispatchEvent(
            new CustomEvent(SPEECH_TRACE_EVENT, {
              detail: { mode: action.mode },
            }),
          );
        });
        break;
      }
      case "copy-email": {
        void navigator.clipboard?.writeText?.(config.email).catch(() => {});
        setCopied(true);
        break;
      }
      case "open-resume": {
        closePalette();
        window.open(resumeUrl, "_blank", "noopener,noreferrer");
        break;
      }
      case "toggle-theme": {
        themeCtx?.toggleTheme();
        closePalette();
        break;
      }
      case "toggle-sound": {
        sound?.toggleSound();
        closePalette();
        break;
      }
      case "scroll": {
        closePalette();
        window.requestAnimationFrame(() => {
          document
            .getElementById(action.targetId)
            ?.scrollIntoView({ behavior: scrollBehavior, block: "center" });
        });
        break;
      }
      case "open-note": {
        closePalette();
        onOpenNote(action.noteId);
        break;
      }
      case "open-pr": {
        closePalette();
        const domId = getContributionDomId(action.record);
        const prDetails = document.getElementById(
          domId,
        ) as HTMLDetailsElement | null;
        if (!prDetails) return;
        const moreDetails = prDetails.closest(
          "#more-contributions-details",
        ) as HTMLDetailsElement | null;
        if (moreDetails) moreDetails.open = true;
        prDetails.open = true;
        window.requestAnimationFrame(() => {
          prDetails.scrollIntoView({ behavior: scrollBehavior, block: "center" });
          prDetails.querySelector("summary")?.focus({ preventScroll: true });
        });
        break;
      }
    }
  };

  const handleInputKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (filtered.length === 0) return;
      const next = (clampedIndex + 1) % filtered.length;
      setActiveIndex(next);
      sound?.playDockTick();
      document
        .getElementById(`cmd-opt-${filtered[next].id}`)
        ?.scrollIntoView({ block: "nearest" });
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      if (filtered.length === 0) return;
      const prev = (clampedIndex - 1 + filtered.length) % filtered.length;
      setActiveIndex(prev);
      sound?.playDockTick();
      document
        .getElementById(`cmd-opt-${filtered[prev].id}`)
        ?.scrollIntoView({ block: "nearest" });
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (clampedIndex >= 0) executeItem(filtered[clampedIndex]);
    } else if (event.key === "Escape") {
      event.preventDefault();
      closePalette();
    }
  };

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
    if (clickedOutside) closePalette();
  };

  const groups: CommandItem["group"][] = [
    "Actions",
    "Projects & Notes",
    "Merged Pull Requests",
  ];

  const activeItem = clampedIndex >= 0 ? filtered[clampedIndex] : undefined;

  return (
    <dialog
      ref={dialogRef}
      closedby="any"
      aria-label="Command palette"
      onClose={closePalette}
      onClick={handleBackdropClick}
      className="folio-dialog mx-auto mt-[10vh] w-[min(34rem,calc(100vw-2rem))] rounded-2xl shadow-2xl"
    >
      <div className="flex max-h-[72vh] flex-col">
        <div className="flex items-center gap-2 border-b border-[var(--line)] px-4 py-3">
          <span
            aria-hidden="true"
            className="font-mono text-[12px] text-[var(--accent)]"
          >
            ›
          </span>
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-expanded="true"
            aria-controls="command-palette-listbox"
            aria-activedescendant={
              activeItem ? `cmd-opt-${activeItem.id}` : undefined
            }
            aria-label="Search commands, projects, and merged pull requests"
            placeholder="Jump to project, search 11 merged PRs, or run an action…"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActiveIndex(0);
            }}
            onKeyDown={handleInputKeyDown}
            className="min-w-0 flex-1 bg-transparent text-[14px] text-[var(--ink)] placeholder:text-[var(--ink-faint)] focus:outline-none"
          />
          <button
            type="button"
            onClick={closePalette}
            aria-label="Close command palette"
            className="folio-btn cursor-pointer rounded border border-[var(--line)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--ink-faint)] hover:text-[var(--ink)]"
          >
            Esc
          </button>
        </div>

        <div
          id="command-palette-listbox"
          role="listbox"
          aria-label="Commands"
          className="overflow-y-auto p-2"
        >
          {filtered.length === 0 ? (
            <p className="px-3 py-6 text-center font-mono text-[12px] text-[var(--ink-faint)]">
              No matching commands or pull requests.
            </p>
          ) : (
            groups.map((groupName) => {
              const groupItems = filtered.filter(
                (item) => item.group === groupName,
              );
              if (groupItems.length === 0) return null;
              return (
                <div key={groupName} className="mb-2 last:mb-0">
                  <p className="px-2.5 pt-2 pb-1 font-mono text-[10px] tracking-[0.1em] text-[var(--ink-faint)] uppercase">
                    {groupName}
                  </p>
                  {groupItems.map((item) => {
                    const idx = filtered.indexOf(item);
                    const isSelected = idx === clampedIndex;
                    return (
                      <div
                        key={item.id}
                        id={`cmd-opt-${item.id}`}
                        role="option"
                        aria-selected={isSelected}
                        onMouseEnter={() => setActiveIndex(idx)}
                        onClick={() => executeItem(item)}
                        className={`flex cursor-pointer items-baseline justify-between gap-3 rounded-lg px-2.5 py-2 text-[13px] transition-colors ${
                          isSelected
                            ? "bg-[var(--logo-well)] text-[var(--ink)]"
                            : "text-[var(--ink-soft)]"
                        }`}
                      >
                        <span className="min-w-0 truncate">{item.label}</span>
                        <span
                          className={`shrink-0 font-mono text-[11px] ${
                            isSelected
                              ? "text-[var(--accent)]"
                              : "text-[var(--ink-faint)]"
                          }`}
                        >
                          {item.detail}
                        </span>
                      </div>
                    );
                  })}
                </div>
              );
            })
          )}
        </div>

        <div className="flex items-center justify-between border-t border-[var(--line)] px-4 py-2 font-mono text-[10px] text-[var(--ink-faint)]">
          <span>↑↓ navigate · ↵ run</span>
          <span>⌘K or / anywhere</span>
        </div>
      </div>
    </dialog>
  );
}
