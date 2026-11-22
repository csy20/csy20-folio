"use client";

import {
  useContext,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
  type DragEvent,
} from "react";
import { SoundContext } from "@/dock/useSound";
import { usePrefersReducedMotion } from "./motion";

const DEFAULT_ENVELOPE_BARS = [
  0.34, 0.58, 0.82, 0.48, 0.94, 0.72, 0.42, 0.88, 0.64, 0.96, 0.54, 0.36,
] as const;

function computeEnvelopeBars(buffer: AudioBuffer, barCount = 12): number[] {
  const channel = buffer.getChannelData(0);
  const blockSize = Math.max(1, Math.floor(channel.length / barCount));
  const raw: number[] = [];
  for (let i = 0; i < barCount; i += 1) {
    const start = i * blockSize;
    const end = Math.min(channel.length, start + blockSize);
    let peak = 0;
    // Stride through samples to keep decode instant even for long FLACs
    const stride = Math.max(1, Math.floor((end - start) / 400));
    for (let j = start; j < end; j += stride) {
      const mag = Math.abs(channel[j] ?? 0);
      if (mag > peak) peak = mag;
    }
    raw.push(peak);
  }
  const maxPeak = Math.max(0.01, ...raw);
  return raw.map((val) => Math.max(0.2, Math.min(1, val / maxPeak)));
}

export function NenEnvelopeMeter() {
  const reduced = usePrefersReducedMotion();
  const sound = useContext(SoundContext);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  const [playing, setPlaying] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [bars, setBars] = useState<readonly number[]>(DEFAULT_ENVELOPE_BARS);
  const [trackName, setTrackName] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  const loadLocalAudioFile = async (file: File) => {
    if (!file.type.startsWith("audio/") && !/\.(mp3|flac|wav|ogg|m4a|aac)$/i.test(file.name)) {
      return;
    }
    sound?.playDockTick();
    audioRef.current?.pause();
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);

    const url = URL.createObjectURL(file);
    objectUrlRef.current = url;
    const cleanName = file.name.replace(/\.[^.]+$/, "");
    setTrackName(cleanName);
    setProgress(0);

    try {
      const arrayBuf = await file.arrayBuffer();
      const AudioCtx =
        window.AudioContext ||
        (window as Window & { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const decoded = await ctx.decodeAudioData(arrayBuf.slice(0));
        setBars(computeEnvelopeBars(decoded, 12));
        void ctx.close().catch(() => {});
      }
    } catch {
      setBars(DEFAULT_ENVELOPE_BARS);
    }

    const audio = new Audio(url);
    audioRef.current = audio;
    audio.addEventListener("timeupdate", () => {
      if (audio.duration > 0) {
        setProgress(audio.currentTime / audio.duration);
      }
    });
    audio.addEventListener("ended", () => {
      setPlaying(false);
      setProgress(0);
    });
    try {
      await audio.play();
      setPlaying(true);
    } catch {
      setPlaying(false);
    }
  };

  const handleTogglePlay = () => {
    sound?.playDockTick();
    const audio = audioRef.current;
    if (audio && trackName) {
      if (playing) {
        audio.pause();
        setPlaying(false);
      } else {
        void audio.play().then(() => setPlaying(true)).catch(() => {});
      }
      return;
    }
    setPlaying((prev) => !prev);
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) void loadLocalAudioFile(file);
    event.target.value = "";
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) void loadLocalAudioFile(file);
  };

  const activeBarCount = trackName ? Math.round(progress * bars.length) : 0;

  return (
    <div
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={`mt-3 flex items-center justify-between gap-2 rounded-lg border px-2.5 py-1.5 font-mono text-[10.5px] transition-colors ${
        dragging
          ? "border-[var(--accent)] bg-[color-mix(in_srgb,var(--accent)_10%,var(--logo-well))]"
          : "border-[var(--line)] bg-[var(--logo-well)]"
      } ${playing ? "nen-playing" : ""}`}
    >
      <div className="flex min-w-0 items-center gap-2">
        <div aria-hidden="true" className="flex h-4 items-end gap-[2.5px]">
          {bars.map((height, index) => (
            <span
              key={index}
              className={`nen-bar w-[2.5px] origin-bottom rounded-full transition-colors ${
                trackName && index < activeBarCount
                  ? "bg-[var(--ink)]"
                  : "bg-[var(--accent)]"
              }`}
              style={
                {
                  height: `${Math.round(height * 16)}px`,
                  "--bar-delay": `${index * 65}ms`,
                  "--bar-dur": `${680 + (index % 4) * 140}ms`,
                } as CSSProperties
              }
            />
          ))}
        </div>
        <span className="truncate text-[var(--ink-faint)]">
          {dragging
            ? "drop audio (offline)"
            : trackName
              ? trackName
              : playing && !reduced
                ? "envelope · playing"
                : "track envelope"}
        </span>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          onChange={handleFileChange}
          aria-label="Load local audio file for offline envelope preview"
          className="sr-only"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          title="Decode any local MP3/FLAC/WAV offline in your browser"
          className="folio-btn cursor-pointer rounded border border-[var(--line)] bg-[var(--card)] px-1.5 py-0.5 text-[10px] text-[var(--ink-faint)] transition-colors hover:border-[var(--accent)] hover:text-[var(--ink)]"
        >
          Drop/File
        </button>
        <button
          type="button"
          onClick={handleTogglePlay}
          aria-label={
            playing
              ? "Pause track envelope preview"
              : "Play track envelope preview"
          }
          className="folio-btn cursor-pointer rounded border border-[var(--line)] bg-[var(--card)] px-1.5 py-0.5 text-[10px] text-[var(--ink-soft)] transition-colors hover:border-[var(--accent)] hover:text-[var(--ink)]"
        >
          {playing ? "Pause" : "Play"}
        </button>
      </div>
    </div>
  );
}

export function BytewiseCacheStrip() {
  const reduced = usePrefersReducedMotion();
  const sound = useContext(SoundContext);
  const [tier, setTier] = useState<"ram" | "sqlite">("ram");
  const [pulsing, setPulsing] = useState(false);
  const timerRef = useRef<number>(0);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  const probe = () => {
    sound?.playDockTick();
    setTier((prev) => (prev === "ram" ? "sqlite" : "ram"));
    if (reduced) return;
    setPulsing(true);
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      timerRef.current = 0;
      setPulsing(false);
    }, 520);
  };

  return (
    <div
      className={`mt-3 flex items-center justify-between gap-2 rounded-lg border border-[var(--line)] bg-[var(--logo-well)] px-2.5 py-1.5 font-mono text-[10.5px] ${
        pulsing ? "cache-pulsing" : ""
      }`}
    >
      <div className="flex min-w-0 items-center gap-1.5">
        <span
          className={`rounded px-1 py-0.5 text-[10px] transition-colors ${
            tier === "ram"
              ? "bg-[color-mix(in_srgb,var(--accent)_16%,var(--card))] text-[var(--ink)]"
              : "text-[var(--ink-faint)]"
          }`}
        >
          RAM
        </span>
        <span
          aria-hidden="true"
          className="cache-trace relative h-[2px] w-6 overflow-hidden rounded-full bg-[var(--line)]"
        >
          <span className="cache-packet absolute inset-y-0 left-0 w-3 rounded-full bg-[var(--accent)]" />
        </span>
        <span
          className={`rounded px-1 py-0.5 text-[10px] transition-colors ${
            tier === "sqlite"
              ? "bg-[color-mix(in_srgb,var(--accent)_16%,var(--card))] text-[var(--ink)]"
              : "text-[var(--ink-faint)]"
          }`}
        >
          SQLite
        </span>
      </div>
      <button
        type="button"
        onClick={probe}
        aria-label="Toggle offline cache read layer"
        className="folio-btn shrink-0 cursor-pointer rounded border border-[var(--line)] bg-[var(--card)] px-1.5 py-0.5 text-[10px] tabular-nums text-[var(--ink-soft)] transition-colors hover:border-[var(--accent)] hover:text-[var(--ink)]"
      >
        {tier === "ram" ? "hot · offline" : "drift · persisted"}
      </button>
    </div>
  );
}
