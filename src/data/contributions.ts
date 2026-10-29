import snapshot from "./contributions.generated.json";

export type ContributionStatus = "merged" | "open" | "closed";

export type Contribution = {
  repository: string;
  number: number;
  title: string;
  url: string;
  status: ContributionStatus;
  createdAt: string;
  updatedAt: string;
  closedAt: string | null;
  mergedAt: string | null;
};

export type ContributionSummary = {
  total: number;
  merged: number;
  open: number;
  closed: number;
  repositories: number;
};

// Keep curation separate from generated data so refreshes preserve it.
// This wallpaper asset submission remains in the snapshot, outside the technical view.
export const curatedContributionExclusions: Readonly<Record<string, string>> = {
  "https://github.com/notparth2005/walli/pull/1":
    "Wallpaper asset submission; this section focuses on engineering contributions.",
};

export function getContributionStatus(record: {
  state: string;
  mergedAt: string | null;
}): ContributionStatus {
  if (record.mergedAt) return "merged";
  return record.state === "open" ? "open" : "closed";
}

export function summarizeContributions(
  records: readonly Contribution[],
): ContributionSummary {
  return {
    total: records.length,
    merged: records.filter((record) => record.status === "merged").length,
    open: records.filter((record) => record.status === "open").length,
    closed: records.filter((record) => record.status === "closed").length,
    repositories: new Set(records.map((record) => record.repository)).size,
  };
}

export const contributionSnapshot = {
  generatedAt: snapshot.generatedAt,
  sourceHref: snapshot.sourceHref,
  sourceUrl: snapshot.sourceUrl,
  coverage: snapshot.coverage,
  complete: snapshot.complete,
  total: snapshot.total,
};

export const contributions: readonly Contribution[] = snapshot.records
  .filter((record) => !(record.url in curatedContributionExclusions))
  .map((record) => ({ ...record, status: getContributionStatus(record) }))
  .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

export const contributionSummary = summarizeContributions(contributions);

function groupContributionRepositories(records: readonly Contribution[]) {
  return [...new Set(records.map((record) => record.repository))]
    .map((repository) => ({
      repository,
      ...summarizeContributions(
        records.filter((record) => record.repository === repository),
      ),
    }))
    .sort(
      (a, b) => b.total - a.total || a.repository.localeCompare(b.repository),
    );
}

export const contributionRepositories =
  groupContributionRepositories(contributions);

// Present merged evidence while preserving all statuses in the source dataset.
export const mergedContributions = contributions.filter(
  (record) => record.status === "merged",
);
export const mergedContributionSummary =
  summarizeContributions(mergedContributions);
export const mergedContributionRepositories =
  groupContributionRepositories(mergedContributions);

export function getContributionDate(record: Contribution): string {
  return record.mergedAt ?? record.closedAt ?? record.createdAt;
}

export function formatContributionDate(value: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}

export function describeContributionTimeline(
  record: Pick<Contribution, "createdAt" | "mergedAt">,
): { opened: string; merged: string | null; daysToMerge: number | null } {
  const opened = formatContributionDate(record.createdAt);
  if (!record.mergedAt) return { opened, merged: null, daysToMerge: null };
  const elapsed = Date.parse(record.mergedAt) - Date.parse(record.createdAt);
  return {
    opened,
    merged: formatContributionDate(record.mergedAt),
    daysToMerge: Math.max(0, Math.floor(elapsed / 86_400_000)),
  };
}
