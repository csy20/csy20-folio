import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const login = "csy20";
const gerritOwner = "csy24022004@gmail.com";
const destination = join(
  dirname(fileURLToPath(import.meta.url)),
  "../src/data/contributions.generated.json",
);

function toIsoUtc(gerritTimestamp) {
  if (!gerritTimestamp) return null;
  return `${gerritTimestamp.slice(0, 19).replace(" ", "T")}Z`;
}

function fetchGitHubPull(repo, number) {
  const raw = execFileSync("gh", ["api", `repos/${repo}/pulls/${number}`], {
    encoding: "utf8",
  });
  const pr = JSON.parse(raw);
  return {
    repository: repo,
    number: pr.number,
    title: pr.title,
    url: pr.html_url,
    state: pr.state,
    createdAt: pr.created_at,
    updatedAt: pr.updated_at,
    closedAt: pr.closed_at,
    mergedAt: pr.merged_at,
  };
}

async function fetchDartGerritChange(number) {
  const response = await fetch(
    `https://dart-review.googlesource.com/changes/sdk~${number}`,
  );
  if (!response.ok) {
    throw new Error(`Gerrit request failed for CL ${number}: ${response.status}`);
  }
  const text = await response.text();
  const payload = JSON.parse(text.replace(/^\)\]\}'\n/, ""));
  const mergedAt = payload.status === "MERGED" ? toIsoUtc(payload.submitted) : null;
  const closedAt =
    payload.status === "MERGED"
      ? mergedAt
      : payload.status === "ABANDONED"
        ? toIsoUtc(payload.updated)
        : null;
  return {
    repository: "dart-lang/sdk",
    number: payload._number,
    title: payload.subject,
    url: `https://dart-review.googlesource.com/c/sdk/+/${payload._number}`,
    state: payload.status === "NEW" ? "open" : "closed",
    createdAt: toIsoUtc(payload.created),
    updatedAt: toIsoUtc(payload.updated),
    closedAt,
    mergedAt,
  };
}

async function fetchRecordByUrl(url) {
  const ghMatch = /^https:\/\/github\.com\/([^/]+\/[^/]+)\/pull\/(\d+)\/?$/.exec(
    url,
  );
  if (ghMatch) {
    return fetchGitHubPull(ghMatch[1], Number(ghMatch[2]));
  }
  const gerritMatch =
    /^https:\/\/dart-review\.googlesource\.com\/c\/sdk\/\+\/(\d+)\/?$/.exec(url);
  if (gerritMatch) {
    return fetchDartGerritChange(Number(gerritMatch[1]));
  }
  throw new Error(`Unsupported contribution URL: ${url}`);
}

async function discoverAllUpstream() {
  const query = `is:pr author:${login} -user:${login} -org:02-OS`;
  const raw = execFileSync(
    "gh",
    [
      "api",
      `search/issues?q=${encodeURIComponent(query)}&per_page=100&sort=updated&order=desc`,
    ],
    { encoding: "utf8" },
  );
  const search = JSON.parse(raw);
  const records = [];

  for (const item of search.items ?? []) {
    const match = /^https:\/\/github\.com\/([^/]+\/[^/]+)\/pull\/(\d+)$/.exec(
      item.html_url,
    );
    if (!match) continue;
    records.push(fetchGitHubPull(match[1], Number(match[2])));
  }

  const gerritRes = await fetch(
    `https://dart-review.googlesource.com/changes/?q=${encodeURIComponent(
      `project:sdk owner:${gerritOwner} status:merged`,
    )}`,
  );
  if (gerritRes.ok) {
    const text = await gerritRes.text();
    const changes = JSON.parse(text.replace(/^\)\]\}'\n/, ""));
    for (const change of changes) {
      records.push(await fetchDartGerritChange(change._number));
    }
  }

  return records;
}

const args = process.argv.slice(2);
const existing = JSON.parse(readFileSync(destination, "utf8"));
const byUrl = new Map(existing.records.map((record) => [record.url, record]));

if (args.includes("--discover")) {
  for (const record of await discoverAllUpstream()) {
    byUrl.set(record.url, record);
  }
} else if (args.length > 0) {
  for (const url of args) {
    const record = await fetchRecordByUrl(url);
    byUrl.set(record.url, record);
  }
} else {
  for (const url of byUrl.keys()) {
    byUrl.set(url, await fetchRecordByUrl(url));
  }
}

const records = [...byUrl.values()].sort((a, b) =>
  b.updatedAt.localeCompare(a.updatedAt),
);

const nextSnapshot = {
  ...existing,
  generatedAt: new Date().toISOString(),
  total: records.length,
  records,
};

writeFileSync(destination, `${JSON.stringify(nextSnapshot, null, 2)}\n`);
console.log(`${records.length} contribution records written to ${destination}`);
