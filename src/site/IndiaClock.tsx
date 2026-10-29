"use client";

import { useSyncExternalStore } from "react";

const timeZone = "Asia/Kolkata";

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

export function IndiaClock() {
  const mounted = useSyncExternalStore(subscribeMounted, () => true, () => false);
  if (!mounted) {
    return <span className="inline-block h-8 w-[7rem]" aria-hidden="true" />;
  }
  return <RunningClock />;
}

function RunningClock() {
  const time = useSyncExternalStore(subscribe, readFace, () => emptyFace);
  const hour = hand(time.hourAngle, 6);
  const minute = hand(time.minuteAngle, 9);

  return (
    <time
      dateTime={time.dateTime || undefined}
      className="inline-flex items-center gap-2 text-[var(--ink)]"
      aria-label={`${time.hh}:${time.mm} India Standard Time`}
    >
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        aria-hidden="true"
        className="shrink-0"
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
        <span className="font-mono text-[13px] leading-none tabular-nums tracking-[0.04em]">
          {time.hh}
          <span className="clock-colon">:</span>
          {time.mm}
          <span className="text-[var(--ink-faint)]">
            <span className="clock-colon">:</span>
            {time.ss}
          </span>
        </span>
        <span className="mt-1 flex items-center gap-1.5 text-[9px] leading-none tracking-[0.18em] text-[var(--ink-faint)]">
          <span className="h-1 w-1 rounded-full bg-[var(--accent)]" aria-hidden="true" />
          IST · BHILAI
        </span>
      </span>
    </time>
  );
}
