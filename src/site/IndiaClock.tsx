"use client";

import { useContext, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { SoundContext } from "@/dock/useSound";

const timeZone = "Asia/Kolkata";
const IST_OFFSET_MINUTES = 330; // UTC+5:30

const formatter = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
  timeZone,
});

type ClockFace = {
  key: string;
  hh: string;
  mm: string;
  ss: string;
  hours: number;
  minutes: number;
  hourAngle: number;
  minuteAngle: number;
  secondAngle: number;
  dateTime: string;
};

const emptyFace: ClockFace = {
  key: "",
  hh: "--",
  mm: "--",
  ss: "--",
  hours: 0,
  minutes: 0,
  hourAngle: 0,
  minuteAngle: 0,
  secondAngle: 0,
  dateTime: "",
};

let face = emptyFace;

function hand(degrees: number, length: number) {
  const rad = (degrees * Math.PI) / 180;
  return {
    x2: 16 + Math.sin(rad) * length,
    y2: 16 - Math.cos(rad) * length,
  };
}

function readFace(): ClockFace {
  const now = new Date();
  const parts = formatter.formatToParts(now);
  const pick = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "00";
  const hh = pick("hour");
  const mm = pick("minute");
  const ss = pick("second");
  const key = `${hh}:${mm}:${ss}`;
  if (face.key === key) return face;
  const hours = Number(hh);
  const minutes = Number(mm);
  const seconds = Number(ss);
  face = {
    key,
    hh,
    mm,
    ss,
    hours,
    minutes,
    hourAngle: ((hours % 12) + minutes / 60) * 30,
    minuteAngle: (minutes + seconds / 60) * 6,
    // Epoch-based so the angle only ever grows; it never snaps back at 60s.
    secondAngle: Math.floor(now.getTime() / 1000) * 6,
    dateTime: `${hh}:${mm}:${ss}`,
  };
  return face;
}

function subscribe(onChange: () => void) {
  const id = window.setInterval(onChange, 200);
  return () => window.clearInterval(id);
}

function subscribeMounted() {
  return () => {};
}

function getDayPhase(hours: number): { label: string; isDay: boolean } {
  if (hours >= 6 && hours < 12) return { label: "Morning · Bhilai", isDay: true };
  if (hours >= 12 && hours < 17) return { label: "Afternoon · Bhilai", isDay: true };
  if (hours >= 17 && hours < 21) return { label: "Evening · Bhilai", isDay: true };
  return { label: "Late night · Bhilai", isDay: false };
}

function formatHourMin(totalMinutes: number): string {
  const normalized = ((totalMinutes % 1440) + 1440) % 1440;
  const h = Math.floor(normalized / 60);
  const m = normalized % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function getTimezoneDelta(visitorOffsetFromUtcMinutes: number) {
  // visitorOffsetFromUtcMinutes = -new Date().getTimezoneOffset()
  const deltaMin = IST_OFFSET_MINUTES - visitorOffsetFromUtcMinutes;
  if (deltaMin === 0) return { label: "Same timezone as you", deltaMin };
  const absH = Math.abs(deltaMin) / 60;
  const formatted = Number.isInteger(absH) ? `${absH}h` : `${absH.toFixed(1)}h`;
  return {
    label:
      deltaMin > 0
        ? `Bhilai is ${formatted} ahead of you`
        : `Bhilai is ${formatted} behind you`,
    deltaMin,
  };
}

export function IndiaClock() {
  const mounted = useSyncExternalStore(subscribeMounted, () => true, () => false);
  if (!mounted) {
    return (
      <span
        className="inline-block h-6 w-[4.1rem] sm:h-8 sm:w-[7rem]"
        aria-hidden="true"
      />
    );
  }
  return <RunningClock />;
}

function RunningClock() {
  const time = useSyncExternalStore(subscribe, readFace, () => emptyFace);
  const sound = useContext(SoundContext);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const hour = hand(time.hourAngle, 6);
  const minute = hand(time.minuteAngle, 9);
  const phase = getDayPhase(time.hours);

  // Visitor timezone comparison (IST = UTC+5:30).
  const visitorUtcOffsetMin = -new Date().getTimezoneOffset();
  const delta = getTimezoneDelta(visitorUtcOffsetMin);
  // Chitresh's core overlap window: 09:00 - 19:00 IST (540..1140)
  const localWorkStart = 9 * 60 - delta.deltaMin;
  const localWorkEnd = 19 * 60 - delta.deltaMin;
  const nowIstPct = ((time.hours * 60 + time.minutes) / 1440) * 100;

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        aria-expanded={open}
        aria-label="Inspect IST timezone overlap"
        onClick={() => {
          sound?.playDockTick();
          setOpen((prev) => !prev);
        }}
        className="folio-btn inline-flex cursor-pointer items-center rounded-lg px-1 py-0.5 transition-colors hover:bg-[var(--card)]"
      >
        <time
          dateTime={time.dateTime || undefined}
          className="inline-flex shrink-0 items-center gap-1.5 text-[var(--ink)] sm:gap-2"
          aria-label={`${time.hh}:${time.mm} India Standard Time`}
        >
          <svg
            width="32"
            height="32"
            viewBox="0 0 32 32"
            aria-hidden="true"
            className="h-6 w-6 shrink-0 max-[359px]:hidden sm:h-8 sm:w-8"
          >
            <circle
              cx="16"
              cy="16"
              r="14.25"
              fill="none"
              stroke="currentColor"
              strokeOpacity="0.2"
              strokeWidth="1"
            />
            <line
              x1="16"
              y1="16"
              x2={hour.x2}
              y2={hour.y2}
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
            <line
              x1="16"
              y1="16"
              x2={minute.x2}
              y2={minute.y2}
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
            <g
              className="clock-second"
              style={{
                transform: `rotate(${time.secondAngle}deg)`,
                transformOrigin: "16px 16px",
              }}
            >
              <line
                x1="16"
                y1="16"
                x2="16"
                y2="5"
                stroke="var(--accent)"
                strokeWidth="0.9"
                strokeLinecap="round"
              />
            </g>
            <circle cx="16" cy="16" r="1.2" fill="currentColor" />
          </svg>
          <span className="flex flex-col items-start">
            <span className="font-mono text-[12px] leading-none tabular-nums tracking-[0.04em] sm:text-[13px]">
              {time.hh}
              <span className="clock-colon">:</span>
              {time.mm}
              <span className="hidden text-[var(--ink-faint)] sm:inline">
                <span className="clock-colon">:</span>
                {time.ss}
              </span>
            </span>
            <span className="mt-1 hidden items-center gap-1.5 text-[9px] leading-none tracking-[0.18em] text-[var(--ink-faint)] sm:flex">
              <span className="h-1 w-1 rounded-full bg-[var(--accent)]" aria-hidden="true" />
              IST · BHILAI
            </span>
          </span>
        </time>
      </button>

      {open ? (
        <div
          role="region"
          aria-label="IST timezone overlap"
          className="absolute top-[calc(100%+10px)] right-0 z-50 w-64 rounded-xl border border-[var(--line)] bg-[var(--page-bg)] p-3 font-mono text-[11px] shadow-xl"
        >
          <div className="flex items-center justify-between gap-2 text-[var(--ink)]">
            <span className="inline-flex items-center gap-1.5">
              <span aria-hidden="true">{phase.isDay ? "☀" : "☾"}</span>
              <span>{phase.label}</span>
            </span>
            <span className="tabular-nums text-[var(--accent)]">
              UTC+5:30
            </span>
          </div>

          <p className="mt-1.5 text-[10.5px] text-[var(--ink-soft)]">
            {delta.label}
          </p>

          <div className="mt-3">
            <div className="mb-1 flex items-center justify-between text-[10px] text-[var(--ink-faint)]">
              <span>00:00 IST</span>
              <span>Core 09–19h</span>
              <span>24:00</span>
            </div>
            <div className="relative h-2 w-full overflow-hidden rounded-full bg-[var(--logo-well)]">
              <div
                className="absolute inset-y-0 rounded-full bg-[color-mix(in_srgb,var(--accent)_45%,transparent)]"
                style={{ left: "37.5%", width: "41.67%" }}
              />
              <span
                aria-hidden="true"
                className="absolute top-0 bottom-0 w-[2px] bg-[var(--accent)]"
                style={{ left: `${nowIstPct}%` }}
              />
            </div>
            <p className="mt-2 text-[10px] text-[var(--ink-faint)]">
              In your clock:{" "}
              <span className="text-[var(--ink)] tabular-nums">
                {formatHourMin(localWorkStart)}–{formatHourMin(localWorkEnd)}
              </span>
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
