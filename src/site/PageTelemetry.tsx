"use client";

import { useContext, useEffect, useState } from "react";
import { SoundContext } from "@/dock/useSound";

export type TelemetrySnapshot = {
  fcpMs: number | null;
  lcpMs: number | null;
  jsKb: number | null;
  domNodes: number;
};

function readInitialTelemetry(): TelemetrySnapshot {
  if (typeof window === "undefined" || typeof performance === "undefined") {
    return { fcpMs: null, lcpMs: null, jsKb: null, domNodes: 0 };
  }

  let fcpMs: number | null = null;
  let jsKb: number | null = null;

  try {
    const paints = performance.getEntriesByType?.("paint") ?? [];
    const fcp = paints.find((entry) => entry.name === "first-contentful-paint");
    if (fcp && fcp.startTime > 0) {
      fcpMs = Math.round(fcp.startTime);
    }
  } catch {
    // Paint timing may be unavailable in test environments.
  }

  try {
    const resources = (performance.getEntriesByType?.("resource") ??
      []) as PerformanceResourceTiming[];
    const jsEntries = resources.filter(
      (entry) =>
        entry.initiatorType === "script" ||
        entry.name.includes("/_next/static/") && entry.name.endsWith(".js"),
    );
    const totalBytes = jsEntries.reduce(
      (sum, entry) =>
        sum + (entry.transferSize || entry.encodedBodySize || 0),
      0,
    );
    if (totalBytes > 0) {
      jsKb = Math.round(totalBytes / 1024);
    }
  } catch {
    // Resource timing may be unavailable in test environments.
  }

  const domNodes =
    typeof document !== "undefined"
      ? document.querySelectorAll("*").length
      : 0;

  return { fcpMs, lcpMs: null, jsKb, domNodes };
}

export function PageTelemetry() {
  const [open, setOpen] = useState(false);
  const [metrics, setMetrics] = useState<TelemetrySnapshot>(readInitialTelemetry);
  const sound = useContext(SoundContext);

  useEffect(() => {
    const refresh = () => {
      setMetrics((prev) => {
        const next = readInitialTelemetry();
        return {
          fcpMs: next.fcpMs ?? prev.fcpMs,
          lcpMs: prev.lcpMs,
          jsKb: next.jsKb ?? prev.jsKb,
          domNodes: next.domNodes || prev.domNodes,
        };
      });
    };

    const timer = window.setTimeout(refresh, 250);

    let lcpObserver: PerformanceObserver | null = null;
    try {
      if (typeof PerformanceObserver !== "undefined") {
        lcpObserver = new PerformanceObserver((list) => {
          const last = list.getEntries().at(-1);
          if (last && last.startTime > 0) {
            setMetrics((prev) => ({
              ...prev,
              lcpMs: Math.round(last.startTime),
            }));
          }
        });
        lcpObserver.observe({
          type: "largest-contentful-paint",
          buffered: true,
        });
      }
    } catch {
      // LCP observer unsupported in some browsers/tests.
    }

    return () => {
      window.clearTimeout(timer);
      lcpObserver?.disconnect();
    };
  }, []);

  const primaryLabel =
    metrics.fcpMs !== null
      ? `FCP ${metrics.fcpMs} ms`
      : metrics.lcpMs !== null
        ? `LCP ${metrics.lcpMs} ms`
        : "Telemetry";

  return (
    <div className="inline-flex flex-wrap items-center gap-2 font-mono text-[11.5px]">
      <button
        type="button"
        aria-expanded={open}
        aria-label="Toggle live page telemetry"
        onClick={() => {
          sound?.playDockTick();
          setMetrics((prev) => ({
            ...prev,
            domNodes:
              typeof document !== "undefined"
                ? document.querySelectorAll("*").length
                : prev.domNodes,
          }));
          setOpen((prev) => !prev);
        }}
        className="folio-btn inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-[var(--line)] bg-[var(--card)] px-2.5 py-1 text-[var(--ink-soft)] tabular-nums transition-colors hover:border-[var(--accent)] hover:text-[var(--ink)]"
      >
        <span
          aria-hidden="true"
          className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]"
        />
        <span>{primaryLabel}</span>
      </button>

      {open ? (
        <dl
          aria-label="Live page telemetry metrics"
          className="inline-flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border border-[var(--line)] bg-[var(--logo-well)] px-2.5 py-1 text-[11px] tabular-nums text-[var(--ink-soft)]"
        >
          <div className="inline-flex items-baseline gap-1">
            <dt className="text-[var(--ink-faint)]">FCP</dt>
            <dd className="text-[var(--ink)]">
              {metrics.fcpMs !== null ? `${metrics.fcpMs} ms` : "static"}
            </dd>
          </div>
          {metrics.lcpMs !== null ? (
            <div className="inline-flex items-baseline gap-1">
              <dt className="text-[var(--ink-faint)]">LCP</dt>
              <dd className="text-[var(--ink)]">{metrics.lcpMs} ms</dd>
            </div>
          ) : null}
          {metrics.jsKb !== null ? (
            <div className="inline-flex items-baseline gap-1">
              <dt className="text-[var(--ink-faint)]">JS</dt>
              <dd className="text-[var(--ink)]">{metrics.jsKb} KB</dd>
            </div>
          ) : null}
          <div className="inline-flex items-baseline gap-1">
            <dt className="text-[var(--ink-faint)]">DOM</dt>
            <dd className="text-[var(--ink)]">{metrics.domNodes}</dd>
          </div>
          <div className="inline-flex items-baseline gap-1">
            <dt className="text-[var(--ink-faint)]">APIs</dt>
            <dd className="text-[var(--accent)]">0 runtime</dd>
          </div>
        </dl>
      ) : null}
    </div>
  );
}
