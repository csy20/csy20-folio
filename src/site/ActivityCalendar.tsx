"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { config } from "@/config";
import {
  activityAriaLabel,
  activityRange,
  activityTotal,
  activityWeeks,
  formatActivityCaption,
  monthLabelColumns,
  weekColumns,
  type ActivityDay,
} from "@/data/activity";
import { CountUp } from "@/site/CountUp";

const cell = 10;
const gap = 2;
const pitch = cell + gap;

const levelClass = [
  "bg-[color-mix(in_srgb,var(--ink)_10%,transparent)]",
  "bg-[color-mix(in_srgb,var(--accent)_32%,transparent)]",
  "bg-[color-mix(in_srgb,var(--accent)_55%,transparent)]",
  "bg-[color-mix(in_srgb,var(--accent)_78%,transparent)]",
  "bg-[var(--accent)]",
] as const;

const columns = weekColumns(activityWeeks);
const monthLabels = monthLabelColumns(activityWeeks);
const summary = activityAriaLabel(
  activityTotal,
  activityRange.start,
  activityRange.end,
);

export function ActivityCalendar() {
  const scroller = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<ActivityDay | null>(null);
  const [fade, setFade] = useState({ left: false, right: false });

  const syncFade = useCallback(() => {
    const element = scroller.current;
    if (!element) return;
    setFade({
      left: element.scrollLeft > 2,
      right: element.scrollLeft + element.clientWidth < element.scrollWidth - 2,
    });
  }, []);

  useEffect(() => {
    const element = scroller.current;
    if (!element) return;
    element.scrollLeft = element.scrollWidth;
    syncFade();
  }, [syncFade]);

  return (
    <figure className="mt-8">
      <a
        href={`https://github.com/${config.githubUsername}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${activityTotal} contributions in the last year`}
        className="page-link inline-flex flex-wrap items-baseline gap-x-1.5 text-[15px]"
      >
        <span className="font-medium text-[var(--ink)]">
          <CountUp to={activityTotal} />
        </span>
        <span className="text-[var(--ink-soft)]">contributions in the last year</span>
      </a>

      <div className="mt-3 flex gap-2">
        <div className="w-7 shrink-0" aria-hidden="true">
          <div className="h-4" />
          <div
            className="grid gap-[2px] text-right font-mono text-[11px] leading-[10px] text-[var(--ink-faint)]"
            style={{ gridTemplateRows: `repeat(7, ${cell}px)` }}
          >
            <span />
            <span>Mon</span>
            <span />
            <span>Wed</span>
            <span />
            <span>Fri</span>
            <span />
          </div>
        </div>

        <div className="relative min-w-0 flex-1">
          <div ref={scroller} className="overflow-x-auto" onScroll={syncFade}>
            <div className="w-max">
              <div className="relative h-4" aria-hidden="true">
                {monthLabels.map((label) => (
                  <span
                    key={`${label.label}-${label.column}`}
                    className="absolute top-0 font-mono text-[11px] leading-4 whitespace-nowrap text-[var(--ink-faint)]"
                    style={{ left: label.column * pitch }}
                  >
                    {label.label}
                  </span>
                ))}
              </div>
              <div
                role="img"
                aria-label={summary}
                className="grid gap-[2px]"
                style={{
                  gridTemplateRows: `repeat(7, ${cell}px)`,
                  gridAutoColumns: `${cell}px`,
                  gridAutoFlow: "column",
                }}
                onMouseLeave={() => setActive(null)}
              >
                {columns.flatMap((slots, column) =>
                  slots.map((day, row) =>
                    day ? (
                      <span
                        key={day.date}
                        data-date={day.date}
                        className={`rounded-[2px] ${levelClass[day.level]}`}
                        onMouseEnter={() => setActive(day)}
                      />
                    ) : (
                      <span key={`empty-${column}-${row}`} />
                    ),
                  ),
                )}
              </div>
            </div>
          </div>
          {fade.left ? (
            <div className="pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-[var(--page-bg)] to-transparent" />
          ) : null}
          {fade.right ? (
            <div className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-[var(--page-bg)] to-transparent" />
          ) : null}
        </div>
      </div>

      <div className="mt-3 flex items-start justify-between gap-4 text-[12px]">
        <p className="min-h-5 text-[13px] leading-5 text-[var(--ink-soft)]">
          {active ? formatActivityCaption(active) : "Each square is a day."}
        </p>
        <div
          className="flex shrink-0 items-center gap-1 text-[var(--ink-faint)]"
          aria-hidden="true"
        >
          <span>Less</span>
          {levelClass.map((tone) => (
            <span
              key={tone}
              className={`rounded-[2px] ${tone}`}
              style={{ width: cell, height: cell }}
            />
          ))}
          <span className="ml-0.5">More</span>
        </div>
      </div>
      <p className="mt-3 text-[13px] leading-5 text-[var(--ink-faint)]">
        Days on GitHub. The list below is the upstream pull requests.
      </p>
    </figure>
  );
}
