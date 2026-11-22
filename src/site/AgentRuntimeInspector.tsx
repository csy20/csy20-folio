"use client";

import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { SoundContext } from "@/dock/useSound";
import { usePrefersReducedMotion } from "./motion";

type RuntimePhase = "clean" | "stale" | "reindexing" | "fresh";

type GraphFile = {
  path: string;
  symbols: number;
  dirty?: boolean;
  diff?: string;
};

const graphFiles: readonly GraphFile[] = [
  { path: "agent-mcp/tools.rs", symbols: 18 },
  {
    path: "agent-memory/stale.rs",
    symbols: 11,
    dirty: true,
    diff: "+14 -3",
  },
  { path: "agent-context/rank.rs", symbols: 14 },
];

export function AgentRuntimeInspector() {
  const reduced = usePrefersReducedMotion();
  const sound = useContext(SoundContext);
  const playTickRef = useRef(sound?.playDockTick);
  const playToneRef = useRef(sound?.playTone);
  useEffect(() => {
    playTickRef.current = sound?.playDockTick;
    playToneRef.current = sound?.playTone;
  }, [sound?.playDockTick, sound?.playTone]);

  const [phase, setPhase] = useState<RuntimePhase>("clean");
  const timerRef = useRef<number>(0);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = 0;
    }
  }, []);

  const triggerStaleEdit = useCallback(() => {
    clearTimer();
    if (playToneRef.current) playToneRef.current({ kind: "stale" });
    else playTickRef.current?.();
    setPhase("stale");
  }, [clearTimer]);

  const runIncrementalIndex = useCallback(() => {
    clearTimer();
    playTickRef.current?.();
    if (reduced) {
      if (playToneRef.current) playToneRef.current({ kind: "fresh" });
      setPhase("fresh");
      return;
    }
    setPhase("reindexing");
    timerRef.current = window.setTimeout(() => {
      timerRef.current = 0;
      setPhase("fresh");
      if (playToneRef.current) playToneRef.current({ kind: "fresh" });
      else playTickRef.current?.();
    }, 340);
  }, [clearTimer, reduced]);

  const reset = useCallback(() => {
    clearTimer();
    playTickRef.current?.();
    setPhase("clean");
  }, [clearTimer]);

  useEffect(() => {
    return () => {
      clearTimer();
    };
  }, [clearTimer]);

  const statusLine =
    phase === "clean"
      ? "HEAD synced · 0 dirty files · SQLite + FTS5 graph warm"
      : phase === "stale"
        ? "git diff → 1 dirty file · staleness gate holds cached facts"
        : phase === "reindexing"
          ? "tree-sitter parsing agent-memory/stale.rs only…"
          : "MCP get_context → fresh · 1/3 files re-parsed · 0 cloud calls";

  const tokenCount = phase === "fresh" ? "1,215" : "1,180";
  const tokenBudgetPct = phase === "fresh" ? (1215 / 4000) * 100 : (1180 / 4000) * 100;

  return (
    <figure
      className="mt-4 rounded-xl border border-[var(--line)] bg-[var(--logo-well)] p-3"
      aria-label="02 agent runtime git-aware staleness inspector"
    >
      <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2 font-mono text-[11px]">
        <div className="flex min-w-0 items-center gap-2">
          <span
            aria-hidden="true"
            className={`h-1.5 w-1.5 shrink-0 rounded-full transition-colors ${
              phase === "stale"
                ? "bg-[var(--pr)]"
                : phase === "reindexing"
                  ? "animate-ping bg-[var(--accent)]"
                  : "bg-[var(--accent)]"
            }`}
          />
          <span className="truncate text-[var(--ink)]">02-agentd</span>
          <span className="hidden text-[var(--ink-faint)] sm:inline">
            · 8 grammars · ~40 MCP tools
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          {phase === "clean" || phase === "fresh" ? (
            <button
              type="button"
              onClick={triggerStaleEdit}
              className="folio-btn cursor-pointer rounded-lg border border-[var(--line)] bg-[var(--card)] px-2 py-1 text-[11px] text-[var(--ink-soft)] transition-colors hover:border-[var(--pr)] hover:text-[var(--ink)]"
            >
              Simulate git edit
            </button>
          ) : (
            <>
              <button
                type="button"
                disabled={phase === "reindexing"}
                onClick={runIncrementalIndex}
                className="folio-btn cursor-pointer rounded-lg border border-[color-mix(in_srgb,var(--accent)_55%,var(--line))] bg-[color-mix(in_srgb,var(--accent)_14%,var(--card))] px-2 py-1 text-[11px] text-[var(--ink)] transition-colors hover:border-[var(--accent)] disabled:opacity-60"
              >
                {phase === "reindexing" ? "Parsing…" : "Re-parse & serve"}
              </button>
              <button
                type="button"
                onClick={reset}
                className="folio-btn cursor-pointer rounded-lg border border-[var(--line)] bg-[var(--card)] px-2 py-1 text-[11px] text-[var(--ink-faint)] transition-colors hover:text-[var(--ink)]"
              >
                Reset
              </button>
            </>
          )}
        </div>
      </div>

      <ul
        aria-label="Tracked workspace symbol graph"
        className="grid gap-1.5 font-mono text-[11px] sm:grid-cols-3"
      >
        {graphFiles.map((file) => {
          const isStale = Boolean(file.dirty) && phase === "stale";
          const isParsing = Boolean(file.dirty) && phase === "reindexing";
          const isUpdated = Boolean(file.dirty) && phase === "fresh";
          const stateBadge = isStale
            ? `stale ${file.diff}`
            : isParsing
              ? "parsing"
              : isUpdated
                ? "re-parsed"
                : "cached";

          return (
            <li
              key={file.path}
              className={`relative flex flex-col justify-between overflow-hidden rounded-lg border px-2.5 py-2 transition-colors ${
                isStale
                  ? "border-[color-mix(in_srgb,var(--pr)_65%,var(--line))] bg-[color-mix(in_srgb,var(--pr)_10%,var(--card))]"
                  : isParsing
                    ? "runtime-scanline border-[color-mix(in_srgb,var(--accent)_65%,var(--line))] bg-[color-mix(in_srgb,var(--accent)_12%,var(--card))]"
                    : isUpdated
                      ? "border-[color-mix(in_srgb,var(--accent)_55%,var(--line))] bg-[color-mix(in_srgb,var(--accent)_10%,var(--card))]"
                      : "border-[var(--line)] bg-[var(--card)]"
              }`}
            >
              <span className="truncate text-[var(--ink)]">{file.path}</span>
              <div className="mt-1.5 flex items-center justify-between gap-2 text-[10px]">
                <span className="tabular-nums text-[var(--ink-faint)]">
                  {isUpdated ? file.symbols + 1 : file.symbols} sym
                </span>
                <span
                  className={
                    isStale
                      ? "text-[var(--pr)]"
                      : isParsing || isUpdated
                        ? "text-[var(--accent)]"
                        : "text-[var(--ink-faint)]"
                  }
                >
                  {stateBadge}
                </span>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 border-t border-[var(--line)] pt-2 font-mono text-[10.5px] text-[var(--ink-faint)]">
        <span aria-live="polite" className="text-[var(--ink-soft)]">
          {statusLine}
        </span>
        <span className="inline-flex items-center gap-2 tabular-nums">
          <span
            aria-hidden="true"
            className="hidden h-1.5 w-14 overflow-hidden rounded-full bg-[var(--card)] sm:inline-block"
          >
            <span
              className={`block h-full rounded-full transition-[width,background-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
                phase === "stale" ? "bg-[var(--pr)]" : "bg-[var(--accent)]"
              }`}
              style={{ width: `${tokenBudgetPct}%` }}
            />
          </span>
          <span>budget {tokenCount} / 4,000 tok</span>
        </span>
      </div>
    </figure>
  );
}
