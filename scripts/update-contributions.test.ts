import { describe, expect, it } from "vitest";
import { buildContributionSnapshot } from "./update-contributions.mjs";

const baseRecord = {
  repository: "dart-lang/sdk",
  number: 575740,
  title: "[analysis_server] Fix named initializing formals",
  url: "https://dart-review.googlesource.com/c/sdk/+/575740",
  state: "closed",
  createdAt: "2026-11-09T18:17:57Z",
  updatedAt: "2026-11-09T19:45:37Z",
  closedAt: "2026-11-09T19:45:37Z",
  mergedAt: "2026-11-09T19:45:37Z",
};

const olderRecord = {
  repository: "semantica-agi/semantica",
  number: 2130,
  title: "fix(config): load the remaining .toml configs with tomllib",
  url: "https://github.com/semantica-agi/semantica/pull/2130",
  state: "closed",
  createdAt: "2026-10-26T20:00:07Z",
  updatedAt: "2026-11-06T10:46:29Z",
  closedAt: "2026-11-06T10:46:29Z",
  mergedAt: "2026-11-06T10:46:29Z",
};

describe("update-contributions snapshot builder", () => {
  it("preserves generatedAt when sorted records are unchanged", () => {
    const existing = {
      generatedAt: "2026-11-10T13:00:02.358Z",
      author: "csy20",
      total: 2,
      records: [baseRecord, olderRecord],
    };

    const result = buildContributionSnapshot(
      existing,
      [olderRecord, baseRecord],
      new Date("2026-11-16T12:00:00.000Z"),
    );

    expect(result.unchanged).toBe(true);
    expect(result.snapshot.generatedAt).toBe(existing.generatedAt);
    expect(result.snapshot.total).toBe(2);
    expect(result.snapshot.records).toEqual([baseRecord, olderRecord]);
  });

  it("updates generatedAt, total, and order when records change", () => {
    const existing = {
      generatedAt: "2026-11-10T13:00:02.358Z",
      author: "csy20",
      total: 1,
      records: [olderRecord],
    };
    const now = new Date("2026-11-16T12:00:00.000Z");

    const result = buildContributionSnapshot(
      existing,
      [olderRecord, baseRecord],
      now,
    );

    expect(result.unchanged).toBe(false);
    expect(result.snapshot.generatedAt).toBe(now.toISOString());
    expect(result.snapshot.total).toBe(2);
    expect(result.snapshot.records.map((r: { number: number }) => r.number)).toEqual([
      575740,
      2130,
    ]);
  });
});
