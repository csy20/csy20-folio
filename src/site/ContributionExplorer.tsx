"use client";

import { useState } from "react";
import { config } from "@/config";
import {
  describeContributionTimeline,
  formatContributionDate,
  getContributionDate,
  getContributionDomId,
  mergedContributionRepositories,
  mergedContributions,
} from "@/data/contributions";

const featuredContributionUrls = [
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
  "redhat-et/ripwire",
  "internetarchive/openlibrary",
  "topoteretes/cognee",
  "agent-of-empires/agent-of-empires",
  "xevrion/breakscale",
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

function ContributionList({
  records,
}: {
  records: typeof mergedContributions;
}) {
  return (
    <ol>
      {records.map((record) => {
        const timeline = describeContributionTimeline(record);
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
                    View pull request on GitHub
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

export function ContributionExplorer() {
  const [selectedRepo, setSelectedRepo] = useState<string | null>(null);

  const filteredContributions = selectedRepo
    ? mergedContributions.filter((record) => record.repository === selectedRepo)
    : null;

  const repoMergedQueryUrl = selectedRepo
    ? `https://github.com/${selectedRepo}/pulls?q=${encodeURIComponent(
        `is:pr author:${config.githubUsername} is:merged`,
      )}`
    : null;

  return (
    <>
      <div
        role="group"
        aria-label="Filter pull requests by repository"
        className="mt-6 mb-5 flex flex-wrap gap-1.5 font-mono text-[11.5px]"
      >
        <button
          type="button"
          aria-pressed={selectedRepo === null}
          onClick={() => setSelectedRepo(null)}
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
              onClick={() => setSelectedRepo(active ? null : item.repository)}
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
              onClick={() => setSelectedRepo(null)}
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
    </>
  );
}
