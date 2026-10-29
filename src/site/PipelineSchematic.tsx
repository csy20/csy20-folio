"use client";

import { motion } from "motion/react";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { speechRelayMetrics } from "@/data/siteContent";
import { SoundContext } from "@/dock/useSound";
import { usePrefersReducedMotion } from "./Opening";

const hops = ["Mic", "VAD", "ASR", "MT", "TTS", "WebRTC out"] as const;
const PLAYBACK_RATE = 2; // 2x playback: 2505 ms trace in ~1.25 s; 4708 ms race in ~2.35 s

export type LatencyLabMode = "trace" | "vad-race";
export const SPEECH_TRACE_EVENT = "csy20:run-speech-trace";

function Arrow({ active }: { active: boolean }) {
  return (
    <svg
      aria-hidden="true"
      width="22"
      height="10"
      viewBox="0 0 22 10"
      className={`mx-1 shrink-0 transition-opacity duration-150 ${
        active ? "text-[var(--accent)] opacity-100" : "text-[var(--ink-faint)] opacity-45"
      }`}
    >
      <path d="M0 5h19M15 1l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

export function PipelineSchematic() {
  const reduced = usePrefersReducedMotion();
  const sound = useContext(SoundContext);
  const playTickRef = useRef(sound?.playDockTick);
  useEffect(() => {
    playTickRef.current = sound?.playDockTick;
  }, [sound?.playDockTick]);

  const { meanMs } = speechRelayMetrics.profile;
  const { fixedWindowMs, vadMs, reductionPercent } = speechRelayMetrics.vadComparison;
  const savedMs = fixedWindowMs - vadMs;

  const [mode, setMode] = useState<LatencyLabMode>("trace");
  const [running, setRunning] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [simMs, setSimMs] = useState<number>(meanMs);
  const [activeHop, setActiveHop] = useState<number>(-1);

  const rafRef = useRef<number>(0);

  const stopAnimation = useCallback(() => {
    if (rafRef.current) {
      window.cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
  }, []);

  const runSimulation = useCallback(
    (targetMode: LatencyLabMode) => {
      stopAnimation();
      setMode(targetMode);
      const durationMs = targetMode === "trace" ? meanMs : fixedWindowMs;

      if (reduced) {
        setRunning(false);
        setCompleted(true);
        setSimMs(durationMs);
        setActiveHop(targetMode === "trace" ? hops.length - 1 : -1);
        return;
      }

      setRunning(true);
      setCompleted(false);
      setSimMs(0);
      setActiveHop(targetMode === "trace" ? 0 : -1);
      playTickRef.current?.();

      const start = performance.now();
      let lastHop = 0;
      let vadLocked = false;

      const step = (now: number) => {
        const nextSim = Math.min(durationMs, (now - start) * PLAYBACK_RATE);
        setSimMs(Math.round(nextSim));

        if (targetMode === "trace") {
          const hopIdx = Math.min(
            hops.length - 1,
            Math.floor((nextSim / durationMs) * hops.length),
          );
          if (hopIdx > lastHop) {
            lastHop = hopIdx;
            setActiveHop(hopIdx);
            playTickRef.current?.();
          }
        } else if (!vadLocked && nextSim >= vadMs) {
          vadLocked = true;
          playTickRef.current?.();
        }

        if (nextSim < durationMs) {
          rafRef.current = window.requestAnimationFrame(step);
        } else {
          rafRef.current = 0;
          setRunning(false);
          setCompleted(true);
          setSimMs(durationMs);
          if (targetMode === "trace") setActiveHop(hops.length - 1);
          playTickRef.current?.();
        }
      };

      rafRef.current = window.requestAnimationFrame(step);
    },
    [fixedWindowMs, meanMs, reduced, stopAnimation, vadMs],
  );

  useEffect(() => {
    const onExternalRun = (event: Event) => {
      const detail = (event as CustomEvent<{ mode?: LatencyLabMode }>).detail;
      runSimulation(detail?.mode ?? "trace");
    };
    window.addEventListener(SPEECH_TRACE_EVENT, onExternalRun);
    return () => {
      window.removeEventListener(SPEECH_TRACE_EVENT, onExternalRun);
      stopAnimation();
    };
  }, [runSimulation, stopAnimation]);

  const selectMode = (nextMode: LatencyLabMode) => {
    if (nextMode === mode && !running) return;
    stopAnimation();
    setMode(nextMode);
    setRunning(false);
    setCompleted(false);
    setActiveHop(-1);
    setSimMs(nextMode === "trace" ? meanMs : fixedWindowMs);
    if (nextMode === "vad-race") {
      runSimulation("vad-race");
    }
  };

  const vadProgressMs = running || completed ? Math.min(vadMs, simMs) : vadMs;
  const fixedProgressMs = running || completed ? Math.min(fixedWindowMs, simMs) : fixedWindowMs;
  const vadWidthPct = (vadProgressMs / fixedWindowMs) * 100;
  const fixedWidthPct = (fixedProgressMs / fixedWindowMs) * 100;
  const vadFinished = (running && simMs >= vadMs) || (!running && (completed || simMs >= vadMs));

  return (
    <figure
      className="mt-4 rounded-xl border border-[var(--line)] bg-[var(--logo-well)] p-3"
      aria-label={`Speech Relay pipeline: Mic, VAD, ASR, MT, TTS, WebRTC out. ${meanMs} ms mean end to end.`}
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div
          role="group"
          aria-label="Speech Relay telemetry mode"
          className="inline-flex rounded-lg border border-[var(--line)] bg-[var(--card)] p-0.5 font-mono text-[11px]"
        >
          <button
            type="button"
            aria-pressed={mode === "trace"}
            onClick={() => selectMode("trace")}
            className={`folio-btn cursor-pointer rounded-md px-2 py-1 transition-colors ${
              mode === "trace"
                ? "bg-[var(--logo-well)] text-[var(--ink)]"
                : "text-[var(--ink-faint)] hover:text-[var(--ink)]"
            }`}
          >
            Pipeline · {meanMs} ms
          </button>
          <button
            type="button"
            aria-pressed={mode === "vad-race"}
            onClick={() => selectMode("vad-race")}
            className={`folio-btn cursor-pointer rounded-md px-2 py-1 transition-colors ${
              mode === "vad-race"
                ? "bg-[var(--logo-well)] text-[var(--ink)]"
                : "text-[var(--ink-faint)] hover:text-[var(--ink)]"
            }`}
          >
            VAD A/B · -{reductionPercent}%
          </button>
        </div>

        <button
          type="button"
          onClick={() => runSimulation(mode)}
          className="folio-btn inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-[var(--line)] bg-[var(--card)] px-2.5 py-1 font-mono text-[11px] text-[var(--ink-soft)] transition-colors hover:border-[var(--accent)] hover:text-[var(--ink)]"
        >
          <span
            aria-hidden="true"
            className={`h-1.5 w-1.5 rounded-full bg-[var(--accent)] ${
              running ? "animate-ping" : ""
            }`}
          />
          {running ? "Running 2×…" : completed ? "Replay (2×)" : "Run (2×)"}
        </button>
      </div>

      {mode === "trace" ? (
        <div className="flex flex-wrap items-end justify-between gap-4">
          <ol className="flex flex-wrap items-center gap-y-2 font-mono text-[11px] text-[var(--ink-soft)]">
            {hops.map((hop, index) => {
              const isReached = activeHop >= index;
              const isCurrent = running && activeHop === index;
              return (
                <li key={hop} className="flex items-center">
                  <motion.span
                    className={`rounded-md border px-2 py-1 transition-colors duration-150 ${
                      isCurrent
                        ? "border-[var(--accent)] bg-[color-mix(in_srgb,var(--accent)_16%,var(--card))] text-[var(--ink)]"
                        : isReached
                          ? "border-[color-mix(in_srgb,var(--accent)_55%,var(--line))] bg-[var(--card)] text-[var(--ink)]"
                          : "border-[var(--line)] bg-[var(--card)]"
                    }`}
                    initial={{ opacity: 0, y: 6 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.35, delay: index * 0.09 }}
                  >
                    {hop}
                  </motion.span>
                  {index < hops.length - 1 ? (
                    <Arrow active={activeHop < 0 || activeHop > index} />
                  ) : null}
                </li>
              );
            })}
          </ol>
          <div className="ml-auto text-right font-mono leading-none">
            <span className="block text-[1.6rem] tracking-[-0.04em] text-[var(--accent)] tabular-nums">
              {running ? simMs : meanMs}
              <span className="ml-1 text-[11px] text-[var(--ink-faint)]">ms</span>
            </span>
            <span className="mt-1 block text-[10px] tracking-[0.12em] text-[var(--ink-faint)] uppercase">
              {running
                ? `hop ${activeHop + 1}/${hops.length} · 2×`
                : "mean end to end"}
            </span>
          </div>
        </div>
      ) : (
        <div className="space-y-2.5 font-mono text-[11px]">
          <div>
            <div className="mb-1 flex items-baseline justify-between gap-2">
              <span className="text-[var(--ink)]">
                Silero-VAD{" "}
                {vadFinished ? (
                  <span className="ml-1 text-[10px] text-[var(--accent)]">
                    -{savedMs.toLocaleString("en-US")} ms (-{reductionPercent}%)
                  </span>
                ) : null}
              </span>
              <span className="tabular-nums text-[var(--accent)]">
                {vadProgressMs.toLocaleString("en-US")} ms
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--card)]">
              <div
                className="h-full rounded-full bg-[var(--accent)]"
                style={{ width: `${vadWidthPct}%` }}
              />
            </div>
          </div>

          <div>
            <div className="mb-1 flex items-baseline justify-between gap-2">
              <span className="text-[var(--ink-soft)]">Fixed-window flush</span>
              <span className="tabular-nums text-[var(--ink-faint)]">
                {fixedProgressMs.toLocaleString("en-US")} ms
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--card)]">
              <div
                className="h-full rounded-full bg-[var(--ink-faint)] opacity-60"
                style={{ width: `${fixedWidthPct}%` }}
              />
            </div>
          </div>

          <p className="pt-0.5 text-[10px] tracking-[0.08em] text-[var(--ink-faint)] uppercase">
            Separate VAD comparison · 2× playback ({vadMs.toLocaleString("en-US")} ms vs{" "}
            {fixedWindowMs.toLocaleString("en-US")} ms)
          </p>
        </div>
      )}
    </figure>
  );
}
