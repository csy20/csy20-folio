"use client";

import { motion } from "motion/react";
import { speechRelayMetrics } from "@/data/siteContent";

const hops = ["Mic", "VAD", "ASR", "MT", "TTS", "WebRTC out"] as const;

function Arrow() {
  return (
    <svg
      aria-hidden="true"
      width="22"
      height="10"
      viewBox="0 0 22 10"
      className="mx-1 shrink-0 text-[var(--accent)]"
    >
      <path d="M0 5h19M15 1l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

export function PipelineSchematic() {
  return (
    <figure
      className="mt-4 flex flex-wrap items-end justify-between gap-4 rounded-xl border border-[var(--line)] bg-[var(--logo-well)] p-3"
      aria-label={`Speech Relay pipeline: Mic, VAD, ASR, MT, TTS, WebRTC out. ${speechRelayMetrics.profile.meanMs} ms mean end to end.`}
    >
      <ol className="flex flex-wrap items-center gap-y-2 font-mono text-[11px] text-[var(--ink-soft)]">
        {hops.map((hop, index) => (
          <li key={hop} className="flex items-center">
            <motion.span
              className="rounded-md border border-[var(--line)] bg-[var(--card)] px-2 py-1"
              initial={{ opacity: 0, y: 6 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: index * 0.09 }}
            >
              {hop}
            </motion.span>
            {index < hops.length - 1 ? <Arrow /> : null}
          </li>
        ))}
      </ol>
      <div className="text-right font-mono leading-none">
        <span className="block text-[1.6rem] tracking-[-0.04em] text-[var(--accent)] tabular-nums">
          {speechRelayMetrics.profile.meanMs}
          <span className="ml-1 text-[11px] text-[var(--ink-faint)]">ms</span>
        </span>
        <span className="mt-1 block text-[10px] tracking-[0.12em] text-[var(--ink-faint)] uppercase">
          mean end to end
        </span>
      </div>
    </figure>
  );
}
