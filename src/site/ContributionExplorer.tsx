"use client";

import { useContext, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { config } from "@/config";
import {
  describeContributionTimeline,
  formatContributionDate,
  getContributionDate,
  getContributionDomId,
  getRepositoryContributionsUrl,
  isGerritContribution,
  mergedContributionRepositories,
  mergedContributions,
  summarizeMergeTurnaround,
} from "@/data/contributions";
import { SoundContext } from "@/dock/useSound";
import { prefersReducedMotion } from "./motion";

const featuredContributionUrls = [
  "https://github.com/NVIDIA/aicr/pull/3342",
  "https://dart-review.googlesource.com/c/sdk/+/575740",
  "https://dart-review.googlesource.com/c/sdk/+/558101",
  "https://dart-review.googlesource.com/c/sdk/+/569580",
  "https://github.com/semantica-agi/semantica/pull/1922",
  "https://github.com/redhat-et/ripwire/pull/244",
  "https://github.com/internetarchive/openlibrary/pull/13611",
] as const;

const featuredContributionSet = new Set<string>(featuredContributionUrls);

const featuredContributions = featuredContributionUrls.map((url) => {
  const record = mergedContributions.find((item) => item.url === url);
  if (!record) throw new Error(`Missing contribution: ${url}`);
  return record;
});

const moreContributions = mergedContributions.filter(
  (record) => !featuredContributionSet.has(record.url),
);

const preferredRepoOrder = [
  "semantica-agi/semantica",
  "dart-lang/sdk",
  "NVIDIA/aicr",
  "redhat-et/ripwire",
  "internetarchive/openlibrary",
  "topoteretes/cognee",
  "agent-of-empires/agent-of-empires",
  "workersio/breakscale",
];

const orderedRepositories = [...mergedContributionRepositories].sort((a, b) => {
  const ai = preferredRepoOrder.indexOf(a.repository);
  const bi = preferredRepoOrder.indexOf(b.repository);
  const aRank = ai === -1 ? Number.MAX_SAFE_INTEGER : ai;
  const bRank = bi === -1 ? Number.MAX_SAFE_INTEGER : bi;
  return (
    aRank - bRank ||
    b.merged - a.merged ||
    a.repository.localeCompare(b.repository)
  );
});

const activePillClass =
  "border-[color-mix(in_srgb,var(--pr)_55%,var(--line))] bg-[color-mix(in_srgb,var(--pr)_12%,var(--card))] text-[var(--ink)]";
const idlePillClass =
  "border-[var(--line)] bg-[var(--card)] text-[var(--ink-soft)] hover:border-[var(--ink-faint)] hover:text-[var(--ink)]";

type ElementWithScopedTransition = HTMLElement & {
  startViewTransition?: (callback: () => void) => {
    ready: Promise<void>;
  };
};

function runScopedTransition(
  scopeEl: HTMLElement | null,
  updateDOM: () => void,
) {
  const el = scopeEl as ElementWithScopedTransition | null;
  if (
    !el ||
    typeof el.startViewTransition !== "function" ||
    prefersReducedMotion()
  ) {
    updateDOM();
    return;
  }

  try {
    const transition = el.startViewTransition(() => {
      flushSync(updateDOM);
    });
    transition.ready?.catch(() => {});
  } catch {
    updateDOM();
  }
}

function TurnaroundBar({
  records,
}: {
  records: typeof mergedContributions;
}) {
  const summary = summarizeMergeTurnaround(records);
  if (summary.total === 0) return null;

  const samePct = (summary.sameDay / summary.total) * 100;
  const weekPct = (summary.withinWeek / summary.total) * 100;
  const longerPct = (summary.longer / summary.total) * 100;

  return (
    <div
      aria-label="Pull request merge turnaround distribution"
      className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[var(--line)] bg-[var(--card)] px-3 py-2 font-mono text-[11px] text-[var(--ink-faint)]"
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="text-[var(--ink-soft)]">Merge velocity</span>
        <span className="tabular-nums">
          <strong className="font-medium text-[var(--ink)]">
            {summary.sameDay}
          </strong>{" "}
          same-day
        </span>
        <span className="tabular-nums">
          <strong className="font-medium text-[var(--ink)]">
            {summary.withinWeek}
          </strong>{" "}
          1–7d
        </span>
        {summary.longer > 0 ? (
          <span className="tabular-nums">
            <strong className="font-medium text-[var(--ink)]">
              {summary.longer}
            </strong>{" "}
            &gt;7d
          </span>
        ) : null}
      </div>
      <div
        aria-hidden="true"
        className="flex h-1.5 w-24 shrink-0 overflow-hidden rounded-full bg-[var(--logo-well)]"
      >
        <span
          className="h-full bg-[var(--pr)] transition-[width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
          style={{ width: `${samePct}%` }}
        />
        <span
          className="h-full bg-[color-mix(in_srgb,var(--pr)_55%,transparent)] transition-[width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
          style={{ width: `${weekPct}%` }}
        />
        <span
          className="h-full bg-[color-mix(in_srgb,var(--ink)_25%,transparent)] transition-[width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
          style={{ width: `${longerPct}%` }}
        />
      </div>
    </div>
  );
}

function ContributionList({
  records,
}: {
  records: typeof mergedContributions;
}) {
  return (
    <ol>
      {records.map((record) => {
        const timeline = describeContributionTimeline(record);
        const isGerrit = isGerritContribution(record);
        return (
          <li key={record.url} className="draw-row border-t border-[var(--line)]">
            <details id={getContributionDomId(record)} className="group/pr">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-4 py-4 marker:content-none [&::-webkit-details-marker]:hidden">
                <span className="min-w-0">
                  <span className="flex items-center gap-2 font-mono text-[12px] text-[var(--ink-faint)]">
                    <span className="rounded border border-[var(--line)] px-1.5 text-[10px] text-[var(--pr)]">
                      merged
                    </span>
                    {record.repository}#{record.number} ·{" "}
                    {formatContributionDate(getContributionDate(record))}
                  </span>
                  <span className="draw-link mt-1 inline-block max-w-full text-[15px] leading-6">
                    {record.title}
                  </span>
                </span>
                <span
                  aria-hidden="true"
                  className="mt-1 font-mono text-[14px] leading-none text-[var(--ink-faint)] transition-transform group-open/pr:rotate-45"
                >
                  +
                </span>
              </summary>
              <div className="show-all-panel">
                <div>
                  <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 pb-3 font-mono text-[12px] text-[var(--ink-soft)]">
                    <dt className="text-[var(--ink-faint)]">Opened</dt>
                    <dd>{timeline.opened}</dd>
                    {timeline.merged ? (
                      <>
                        <dt className="text-[var(--ink-faint)]">Merged</dt>
                        <dd>
                          {timeline.merged}
                          {timeline.daysToMerge !== null
                            ? timeline.daysToMerge === 0
                              ? " · same day"
                              : ` · after ${timeline.daysToMerge} ${timeline.daysToMerge === 1 ? "day" : "days"}`
                            : null}
                        </dd>
                      </>
                    ) : null}
                  </dl>
                  <a
                    href={record.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="page-link mb-4 inline-block text-[13px] text-[var(--ink-soft)] underline-offset-4 hover:underline"
                  >
                    {isGerrit
                      ? "View change on Gerrit"
                      : "View pull request on GitHub"}
                  </a>
                </div>
              </div>
            </details>
          </li>
        );
      })}
    </ol>
  );
}

function shortRepoLabel(repository: string): string {
  const [owner, name] = repository.split("/");
  if (owner === "NVIDIA" || owner === "dart-lang") return repository;
  return name ?? repository;
}

function ContributionConstellation({
  selectedRepo,
  onSelectRepo,
}: {
  selectedRepo: string | null;
  onSelectRepo: (repo: string | null) => void;
}) {
  const cx = 240;
  const cy = 112;
  const rx = 165;
  const ry = 76;
  const count = orderedRepositories.length;

  return (
    <figure
      aria-label="Upstream repositories constellation graph"
      className="mb-4 overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--card)] p-3"
    >
      <svg
        viewBox="0 0 480 224"
        className="h-auto w-full select-none"
        role="img"
        aria-label={`Radial graph connecting csy20 to ${count} upstream repositories`}
      >
        {orderedRepositories.map((item, index) => {
          const angle = -Math.PI / 2 + (index / count) * Math.PI * 2;
          const x = cx + Math.cos(angle) * rx;
          const y = cy + Math.sin(angle) * ry;
          const active = selectedRepo === item.repository;
          const dimmed = selectedRepo !== null && !active;

          return (
            <line
              key={`edge-${item.repository}`}
              x1={cx}
              y1={cy}
              x2={x}
              y2={y}
              stroke={active ? "var(--pr)" : "var(--line)"}
              strokeWidth={active ? 1.8 : 1.1}
              strokeDasharray={active ? "4 3" : undefined}
              opacity={dimmed ? 0.35 : 1}
              className="transition-all duration-200"
            />
          );
        })}

        <g
          role="button"
          tabIndex={0}
          aria-label="Show all repositories"
          onClick={() => onSelectRepo(null)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              onSelectRepo(null);
            }
          }}
          className="cursor-pointer focus:outline-none"
        >
          <circle
            cx={cx}
            cy={cy}
            r={22}
            fill="var(--logo-well)"
            stroke={selectedRepo === null ? "var(--accent)" : "var(--line)"}
            strokeWidth={1.5}
          />
          <text
            x={cx}
            y={cy + 3.5}
            textAnchor="middle"
            fill="var(--ink)"
            fontSize="10.5"
            fontFamily="var(--font-geist-mono), monospace"
          >
            csy20
          </text>
        </g>

        {orderedRepositories.map((item, index) => {
          const angle = -Math.PI / 2 + (index / count) * Math.PI * 2;
          const x = cx + Math.cos(angle) * rx;
          const y = cy + Math.sin(angle) * ry;
          const radius = Math.min(18, 9 + item.merged * 1.4);
          const active = selectedRepo === item.repository;
          const dimmed = selectedRepo !== null && !active;
          const labelY = y < cy ? y - radius - 6 : y + radius + 12;

          return (
            <g
              key={item.repository}
              role="button"
              tabIndex={0}
              aria-label={`Filter by ${item.repository} (${item.merged} merged)`}
              onClick={() => onSelectRepo(active ? null : item.repository)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onSelectRepo(active ? null : item.repository);
                }
              }}
              opacity={dimmed ? 0.45 : 1}
              className="cursor-pointer transition-opacity duration-200 focus:outline-none"
            >
              <circle
                cx={x}
                cy={y}
                r={radius}
                fill={
                  active
                    ? "color-mix(in srgb, var(--pr) 24%, var(--page-bg))"
                    : "var(--logo-well)"
                }
                stroke={active ? "var(--pr)" : "var(--ink-faint)"}
                strokeWidth={active ? 1.8 : 1.1}
              />
              <text
                x={x}
                y={y + 3.5}
                textAnchor="middle"
                fill="var(--ink)"
                fontSize="10"
                fontFamily="var(--font-geist-mono), monospace"
              >
                {item.merged}
              </text>
              <text
                x={x}
                y={labelY}
                textAnchor="middle"
                fill={active ? "var(--ink)" : "var(--ink-soft)"}
                fontSize="9.5"
                fontFamily="var(--font-geist-mono), monospace"
              >
                {shortRepoLabel(item.repository)}
              </text>
            </g>
          );
        })}
      </svg>
      <p className="mt-1 text-center font-mono text-[10px] text-[var(--ink-faint)]">
        Click any upstream node to filter merged pull requests below · center resets
      </p>
    </figure>
  );
}

export function ContributionExplorer() {
  const [selectedRepo, setSelectedRepo] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "graph">("list");
  const scopeRef = useRef<HTMLDivElement>(null);
  const sound = useContext(SoundContext);

  const selectRepoWithTransition = (nextRepo: string | null) => {
    sound?.playDockTick();
    runScopedTransition(scopeRef.current, () => {
      setSelectedRepo(nextRepo);
    });
  };

  useEffect(() => {
    const syncPrHash = () => {
      const hash = window.location.hash;
      if (!hash.startsWith("#pr-")) return;
      const domId = hash.slice(1);
      const inMore = moreContributions.some(
        (record) => getContributionDomId(record) === domId,
      );
      if (inMore) {
        const moreDetails = document.getElementById(
          "more-contributions-details",
        ) as HTMLDetailsElement | null;
        if (moreDetails) moreDetails.open = true;
      }
      const target = document.getElementById(
        domId,
      ) as HTMLDetailsElement | null;
      if (target) {
        target.open = true;
        target.scrollIntoView?.({ block: "nearest" });
      }
    };

    syncPrHash();
    window.addEventListener("hashchange", syncPrHash);
    return () => window.removeEventListener("hashchange", syncPrHash);
  }, []);

  const filteredContributions = selectedRepo
    ? mergedContributions.filter((record) => record.repository === selectedRepo)
    : null;

  const activeRecords = filteredContributions ?? mergedContributions;

  const repoMergedQueryUrl = selectedRepo
    ? getRepositoryContributionsUrl(selectedRepo, config.githubUsername)
    : null;

  return (
    <div ref={scopeRef}>
      <div
        role="group"
        aria-label="Filter pull requests by repository"
        className="mt-6 mb-4 flex flex-wrap gap-1.5 font-mono text-[11.5px]"
      >
        <button
          type="button"
          aria-pressed={selectedRepo === null}
          onClick={() => selectRepoWithTransition(null)}
          className={`folio-btn cursor-pointer rounded-lg border px-2.5 py-1 transition-colors ${
            selectedRepo === null ? activePillClass : idlePillClass
          }`}
        >
          All
          <span className="ml-1.5 tabular-nums text-[var(--ink-faint)]">
            {mergedContributions.length}
          </span>
        </button>
        {orderedRepositories.map((item) => {
          const active = selectedRepo === item.repository;
          return (
            <button
              key={item.repository}
              type="button"
              aria-pressed={active}
              onClick={() =>
                selectRepoWithTransition(active ? null : item.repository)
              }
              className={`folio-btn cursor-pointer rounded-lg border px-2.5 py-1 transition-colors ${
                active ? activePillClass : idlePillClass
              }`}
            >
              {item.repository}
              <span className="ml-1.5 tabular-nums text-[var(--ink-faint)]">
                {item.merged}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <TurnaroundBar records={activeRecords} />
        </div>
        <div
          role="group"
          aria-label="Open source view mode"
          className="inline-flex shrink-0 rounded-lg border border-[var(--line)] bg-[var(--card)] p-0.5 font-mono text-[11px]"
        >
          <button
            type="button"
            aria-pressed={viewMode === "list"}
            onClick={() => {
              sound?.playDockTick();
              setViewMode("list");
            }}
            className={`folio-btn cursor-pointer rounded-md px-2 py-1 transition-colors ${
              viewMode === "list"
                ? "bg-[var(--logo-well)] text-[var(--ink)]"
                : "text-[var(--ink-faint)] hover:text-[var(--ink)]"
            }`}
          >
            List
          </button>
          <button
            type="button"
            aria-pressed={viewMode === "graph"}
            onClick={() => {
              sound?.playDockTick();
              setViewMode("graph");
            }}
            className={`folio-btn cursor-pointer rounded-md px-2 py-1 transition-colors ${
              viewMode === "graph"
                ? "bg-[var(--logo-well)] text-[var(--ink)]"
                : "text-[var(--ink-faint)] hover:text-[var(--ink)]"
            }`}
          >
            Graph
          </button>
        </div>
      </div>

      {viewMode === "graph" ? (
        <ContributionConstellation
          selectedRepo={selectedRepo}
          onSelectRepo={selectRepoWithTransition}
        />
      ) : null}

      {selectedRepo && filteredContributions && repoMergedQueryUrl ? (
        <div>
          <div className="mb-3 flex flex-wrap items-baseline justify-between gap-3 font-mono text-[12px] text-[var(--ink-faint)]">
            <span>
              {filteredContributions.length} merged{" "}
              {filteredContributions.length === 1 ? "PR" : "PRs"} in{" "}
              <a
                href={repoMergedQueryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="page-link text-[var(--ink)] underline-offset-4 hover:underline"
              >
                {selectedRepo} ↗
              </a>
            </span>
            <button
              type="button"
              onClick={() => selectRepoWithTransition(null)}
              className="folio-btn cursor-pointer text-[var(--ink-soft)] underline-offset-4 hover:text-[var(--ink)] hover:underline"
            >
              Show all repos
            </button>
          </div>
          <ContributionList records={filteredContributions} />
        </div>
      ) : (
        <>
          <ContributionList records={featuredContributions} />
          {moreContributions.length > 0 ? (
            <details id="more-contributions-details" className="group">
              <summary className="flex cursor-pointer list-none items-baseline justify-between gap-4 border-t border-[var(--line)] py-3 text-[13px] text-[var(--ink-soft)] marker:content-none [&::-webkit-details-marker]:hidden">
                <span className="group-open:hidden">
                  Show all {mergedContributions.length}
                </span>
                <span className="hidden group-open:inline">Show less</span>
                <span className="font-mono text-[11px] text-[var(--ink-faint)] group-open:hidden">
                  {moreContributions.length} more
                </span>
              </summary>
              <div className="show-all-panel">
                <div>
                  <ContributionList records={moreContributions} />
                </div>
              </div>
            </details>
          ) : null}
        </>
      )}
    </div>
  );
}
