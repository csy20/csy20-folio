"use client";

import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { speechRelayMetrics } from "@/data/siteContent";
import { SoundContext } from "@/dock/useSound";
import { usePrefersReducedMotion } from "./Opening";

const hops = ["Mic", "VAD", "ASR", "MT", "TTS", "WebRTC out"] as const;
const PLAYBACK_RATE = 2; // 2x playback: 2505 ms trace in ~1.25 s; 4708 ms race in ~2.35 s

export type LatencyLabMode = "trace" | "vad-race" | "live-vad";
export const SPEECH_TRACE_EVENT = "csy20:run-speech-trace";

function Arrow({ active, pulse }: { active: boolean; pulse: boolean }) {
  return (
    <svg
      aria-hidden="true"
      width="22"
      height="10"
      viewBox="0 0 22 10"
      className={`mx-1 hidden shrink-0 transition-opacity duration-150 sm:block ${
        active ? "text-[var(--accent)] opacity-100" : "text-[var(--ink-faint)] opacity-45"
      }`}
    >
      <path
        d="M0 5h19M15 1l4 4-4 4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        opacity={pulse ? 0.35 : 1}
      />
      {pulse ? (
        <path
          d="M0 5h19"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          className="signal-arrow-active"
        />
      ) : null}
    </svg>
  );
}

function MobileConnector({ active }: { active: boolean }) {
  return (
    <svg
      aria-hidden="true"
      width="10"
      height="10"
      viewBox="0 0 10 10"
      className={`shrink-0 transition-opacity duration-150 sm:hidden ${
        active ? "text-[var(--accent)] opacity-100" : "text-[var(--ink-faint)] opacity-45"
      }`}
    >
      <path d="M1 5h7M5.5 2L8.5 5 5.5 8" fill="none" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

function LiveVadOscilloscope({ reduced }: { reduced: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [source, setSource] = useState<"demo" | "mic">("demo");
  const [micStatus, setMicStatus] = useState<string>("synthetic voice burst · 0 server calls");
  const [speaking, setSpeaking] = useState(false);
  const [flushes, setFlushes] = useState(0);
  const sound = useContext(SoundContext);

  const micCleanupRef = useRef<(() => void) | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array<ArrayBuffer> | null>(null);

  const stopMic = useCallback(() => {
    micCleanupRef.current?.();
    micCleanupRef.current = null;
    analyserRef.current = null;
    dataArrayRef.current = null;
  }, []);

  const toggleMic = async () => {
    sound?.playDockTick();
    if (source === "mic") {
      stopMic();
      setSource("demo");
      setMicStatus("synthetic voice burst · 0 server calls");
      return;
    }

    if (
      typeof navigator === "undefined" ||
      !navigator.mediaDevices?.getUserMedia
    ) {
      setMicStatus("mic unavailable — running local synthetic VAD");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const AudioCtx =
        window.AudioContext ||
        (window as Window & { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      const ctx = new AudioCtx();
      const mediaSrc = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      mediaSrc.connect(analyser);

      analyserRef.current = analyser;
      dataArrayRef.current = new Uint8Array(new ArrayBuffer(analyser.fftSize));
      micCleanupRef.current = () => {
        stream.getTracks().forEach((track) => track.stop());
        mediaSrc.disconnect();
        void ctx.close().catch(() => {});
      };
      setSource("mic");
      setMicStatus("live mic · 100% on-device Web Audio");
    } catch {
      setSource("demo");
      setMicStatus("mic permission declined — using synthetic voice");
    }
  };

  useEffect(() => {
    return () => stopMic();
  }, [stopMic]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let rafId = 0;
    let wasSpeaking = false;
    let flushCount = 0;
    const startMs = performance.now();

    const draw = (now: number) => {
      const dpr = window.devicePixelRatio || 1;
      const width = canvas.clientWidth || 320;
      const height = canvas.clientHeight || 56;
      if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      const style = getComputedStyle(document.documentElement);
      const accent = style.getPropertyValue("--accent").trim() || "#38bdf8";
      const faint = style.getPropertyValue("--ink-faint").trim() || "#8d8b84";
      const line = style.getPropertyValue("--line").trim() || "rgba(255,255,255,0.1)";

      const midY = height / 2;
      const thresholdY = height * 0.28;

      // Centerline + VAD gate threshold hairlines
      ctx.strokeStyle = line;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, midY);
      ctx.lineTo(width, midY);
      ctx.stroke();

      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(0, midY - thresholdY);
      ctx.lineTo(width, midY - thresholdY);
      ctx.moveTo(0, midY + thresholdY);
      ctx.lineTo(width, midY + thresholdY);
      ctx.stroke();
      ctx.setLineDash([]);

      let rms = 0;
      const samples = 64;
      const points: number[] = [];

      if (source === "mic" && analyserRef.current && dataArrayRef.current) {
        analyserRef.current.getByteTimeDomainData(dataArrayRef.current);
        const buf = dataArrayRef.current;
        let sumSq = 0;
        const step = Math.max(1, Math.floor(buf.length / samples));
        for (let i = 0; i < samples; i += 1) {
          const v = ((buf[i * step] ?? 128) - 128) / 128;
          sumSq += v * v;
          points.push(v);
        }
        rms = Math.sqrt(sumSq / samples);
      } else {
        const t = (now - startMs) / 1000;
        // Repeating 3.4s utterance cadence: 1.9s voiced, 1.5s pause
        const cycle = t % 3.4;
        const envelope =
          cycle < 1.9
            ? Math.sin((cycle / 1.9) * Math.PI) *
              (0.55 + 0.45 * Math.sin(t * 7.2) ** 2)
            : 0.04;
        let sumSq = 0;
        for (let i = 0; i < samples; i += 1) {
          const x = i / samples;
          const wave =
            envelope *
            (0.6 * Math.sin(x * 26 + t * 14) +
              0.3 * Math.sin(x * 54 - t * 21) +
              0.1 * Math.cos(x * 90 + t * 9));
          sumSq += wave * wave;
          points.push(wave);
        }
        rms = Math.sqrt(sumSq / samples);
      }

      const isVoice = rms > (source === "mic" ? 0.045 : 0.16);
      if (isVoice !== wasSpeaking) {
        if (wasSpeaking && !isVoice) {
          flushCount += 1;
          setFlushes(flushCount);
        }
        wasSpeaking = isVoice;
        setSpeaking(isVoice);
      }

      ctx.strokeStyle = isVoice ? accent : faint;
      ctx.lineWidth = isVoice ? 1.8 : 1.25;
      ctx.beginPath();
      for (let i = 0; i < points.length; i += 1) {
        const x = (i / (points.length - 1)) * width;
        const y = midY + (points[i] ?? 0) * (height * 0.44);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.restore();

      if (!reduced) {
        rafId = window.requestAnimationFrame(draw);
      }
    };

    draw(performance.now());
    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, [reduced, source]);

  return (
    <div className="space-y-2 font-mono text-[11px]">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className={`h-1.5 w-1.5 rounded-full transition-colors ${
              speaking ? "bg-[var(--accent)]" : "bg-[var(--ink-faint)] opacity-50"
            }`}
          />
          <span className={speaking ? "text-[var(--ink)]" : "text-[var(--ink-soft)]"}>
            {speaking ? "VAD gate: SPEECH" : "VAD gate: silence"}
          </span>
          <span className="tabular-nums text-[var(--ink-faint)]">
            · {flushes} {flushes === 1 ? "flush" : "flushes"}
          </span>
        </div>
        <button
          type="button"
          onClick={toggleMic}
          className={`folio-btn cursor-pointer rounded-md border px-2 py-0.5 text-[10.5px] transition-colors ${
            source === "mic"
              ? "border-[var(--accent)] bg-[color-mix(in_srgb,var(--accent)_14%,var(--card))] text-[var(--ink)]"
              : "border-[var(--line)] bg-[var(--card)] text-[var(--ink-soft)] hover:border-[var(--accent)] hover:text-[var(--ink)]"
          }`}
        >
          {source === "mic" ? "Stop mic" : "Use mic"}
        </button>
      </div>

      <canvas
        ref={canvasRef}
        aria-label="Live voice activity detection oscilloscope"
        className="block h-14 w-full rounded-lg border border-[var(--line)] bg-[var(--card)]"
      />

      <p className="text-[10px] tracking-[0.06em] text-[var(--ink-faint)] uppercase">
        {micStatus}
      </p>
    </div>
  );
}

export function PipelineSchematic() {
  const reduced = usePrefersReducedMotion();
  const sound = useContext(SoundContext);
  const playTickRef = useRef(sound?.playDockTick);
  const playToneRef = useRef(sound?.playTone);
  useEffect(() => {
    playTickRef.current = sound?.playDockTick;
    playToneRef.current = sound?.playTone;
  }, [sound?.playDockTick, sound?.playTone]);

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

  const emitHopSound = useCallback((step: number, done = false) => {
    if (playToneRef.current) {
      playToneRef.current(done ? { kind: "complete" } : { kind: "hop", step });
    } else {
      playTickRef.current?.();
    }
  }, []);

  const runSimulation = useCallback(
    (targetMode: LatencyLabMode) => {
      stopAnimation();
      setMode(targetMode);
      if (targetMode === "live-vad") {
        setRunning(false);
        setCompleted(false);
        setActiveHop(-1);
        return;
      }
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
      emitHopSound(0);

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
            emitHopSound(hopIdx);
          }
        } else if (!vadLocked && nextSim >= vadMs) {
          vadLocked = true;
          emitHopSound(4);
        }

        if (nextSim < durationMs) {
          rafRef.current = window.requestAnimationFrame(step);
        } else {
          rafRef.current = 0;
          setRunning(false);
          setCompleted(true);
          setSimMs(durationMs);
          if (targetMode === "trace") setActiveHop(hops.length - 1);
          emitHopSound(hops.length - 1, true);
        }
      };

      rafRef.current = window.requestAnimationFrame(step);
    },
    [emitHopSound, fixedWindowMs, meanMs, reduced, stopAnimation, vadMs],
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
    } else if (nextMode === "live-vad") {
      playTickRef.current?.();
    }
  };

  const vadProgressMs = running || completed ? Math.min(vadMs, simMs) : vadMs;
  const fixedProgressMs = running || completed ? Math.min(fixedWindowMs, simMs) : fixedWindowMs;
  const vadWidthPct = (vadProgressMs / fixedWindowMs) * 100;
  const fixedWidthPct = (fixedProgressMs / fixedWindowMs) * 100;
  const vadFinished = (running && simMs >= vadMs) || (!running && (completed || simMs >= vadMs));
  const runLabel = running ? "Running 2×…" : completed ? "Replay (2×)" : "Run (2×)";
  const modeIndex = mode === "trace" ? 0 : mode === "vad-race" ? 1 : 2;

  return (
    <figure
      className="mt-4 rounded-xl border border-[var(--line)] bg-[var(--logo-well)] p-3"
      aria-label={`Speech Relay pipeline: Mic, VAD, ASR, MT, TTS, WebRTC out. ${meanMs} ms mean end to end.`}
    >
      <div className="mb-3 flex flex-nowrap items-center justify-between gap-2">
        <div
          role="group"
          aria-label="Speech Relay telemetry mode"
          className="relative grid min-w-0 grid-cols-3 rounded-lg border border-[var(--line)] bg-[var(--card)] p-0.5 font-mono text-[10px] sm:text-[11px]"
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0.5 left-0.5 w-[calc((100%-4px)/3)] rounded-md bg-[var(--logo-well)] transition-transform duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
            style={{
              transform: `translateX(${modeIndex * 100}%)`,
            }}
          />
          <button
            type="button"
            aria-pressed={mode === "trace"}
            onClick={() => selectMode("trace")}
            className={`folio-btn relative z-10 cursor-pointer truncate rounded-md px-1.5 py-1 transition-colors sm:px-2 ${
              mode === "trace"
                ? "text-[var(--ink)]"
                : "text-[var(--ink-faint)] hover:text-[var(--ink)]"
            }`}
          >
            Pipeline · {meanMs} ms
          </button>
          <button
            type="button"
            aria-pressed={mode === "vad-race"}
            onClick={() => selectMode("vad-race")}
            className={`folio-btn relative z-10 cursor-pointer truncate rounded-md px-1.5 py-1 transition-colors sm:px-2 ${
              mode === "vad-race"
                ? "text-[var(--ink)]"
                : "text-[var(--ink-faint)] hover:text-[var(--ink)]"
            }`}
          >
            VAD A/B · -{reductionPercent}%
          </button>
          <button
            type="button"
            aria-pressed={mode === "live-vad"}
            onClick={() => selectMode("live-vad")}
            className={`folio-btn relative z-10 cursor-pointer truncate rounded-md px-1.5 py-1 transition-colors sm:px-2 ${
              mode === "live-vad"
                ? "text-[var(--ink)]"
                : "text-[var(--ink-faint)] hover:text-[var(--ink)]"
            }`}
          >
            Live VAD
          </button>
        </div>

        {mode !== "live-vad" ? (
          <button
            type="button"
            onClick={() => runSimulation(mode)}
            title={runLabel}
            className="folio-btn inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-[var(--line)] bg-[var(--card)] px-2 py-1.5 font-mono text-[11px] text-[var(--ink-soft)] transition-colors hover:border-[var(--accent)] hover:text-[var(--ink)] sm:px-2.5 sm:py-1"
          >
            <span
              aria-hidden="true"
              className={`hidden h-1.5 w-1.5 rounded-full bg-[var(--accent)] sm:inline-block ${
                running ? "animate-ping" : ""
              }`}
            />
            <svg
              aria-hidden="true"
              width="11"
              height="11"
              viewBox="0 0 12 12"
              className={`text-[var(--accent)] sm:hidden ${running ? "animate-pulse" : ""}`}
            >
              <path d="M2.5 1.8L10 6L2.5 10.2V1.8Z" fill="currentColor" />
            </svg>
            <span className="max-sm:sr-only">{runLabel}</span>
          </button>
        ) : null}
      </div>

      {mode === "trace" ? (
        <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between sm:gap-4">
          <ol className="grid w-full grid-cols-3 gap-1.5 font-mono text-[11px] text-[var(--ink-soft)] sm:flex sm:w-auto sm:flex-wrap sm:items-center sm:gap-0 sm:gap-y-2">
            {hops.map((hop, index) => {
              const isReached = activeHop >= index;
              const isCurrent = running && activeHop === index;
              const arrowActive = activeHop < 0 || activeHop > index;
              return (
                <li key={hop} className="flex min-w-0 items-center gap-1 sm:gap-0">
                  <span
                    className={`flex-1 truncate rounded-md border px-1.5 py-1 text-center transition-colors duration-150 sm:flex-none sm:px-2 ${
                      isCurrent
                        ? "border-[var(--accent)] bg-[color-mix(in_srgb,var(--accent)_16%,var(--card))] text-[var(--ink)]"
                        : isReached
                          ? "border-[color-mix(in_srgb,var(--accent)_55%,var(--line))] bg-[var(--card)] text-[var(--ink)]"
                          : "border-[var(--line)] bg-[var(--card)]"
                    }`}
                  >
                    {hop}
                  </span>
                  {index < hops.length - 1 ? (
                    <Arrow
                      active={arrowActive}
                      pulse={running && activeHop === index}
                    />
                  ) : null}
                  {index < hops.length - 1 && index !== 2 ? (
                    <MobileConnector active={arrowActive} />
                  ) : null}
                </li>
              );
            })}
          </ol>
          <div className="flex w-full items-baseline justify-between border-t border-[var(--line)] pt-2 font-mono leading-none sm:ml-auto sm:w-auto sm:flex-col sm:items-end sm:border-0 sm:pt-0 sm:text-right">
            <span className="order-2 text-[1.35rem] tracking-[-0.04em] text-[var(--accent)] tabular-nums sm:order-1 sm:block sm:text-[1.6rem]">
              {running ? simMs : meanMs}
              <span className="ml-1 text-[11px] text-[var(--ink-faint)]">ms</span>
            </span>
            <span className="order-1 text-[10px] tracking-[0.12em] text-[var(--ink-faint)] uppercase sm:order-2 sm:mt-1 sm:block">
              {running
                ? `hop ${activeHop + 1}/${hops.length} · 2×`
                : "mean end to end"}
            </span>
          </div>
        </div>
      ) : mode === "vad-race" ? (
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
      ) : (
        <LiveVadOscilloscope reduced={reduced} />
      )}
    </figure>
  );
}
