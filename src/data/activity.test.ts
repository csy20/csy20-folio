import { describe, expect, it } from "vitest";
import snapshot from "./activity.generated.json";
import {
  activityAriaLabel,
  activityRange,
  activityTotal,
  activityWeeks,
  formatActivityCaption,
  monthLabelColumns,
  weekColumns,
  type ActivityWeek,
} from "./activity";

describe("activity calendar snapshot", () => {
  it("matches the generated GitHub calendar without repository names", () => {
    const counted = snapshot.weeks.reduce(
      (sum, week) => sum + week.days.reduce((inner, day) => inner + day.count, 0),
      0,
    );

    expect(snapshot.author).toBe("csy20");
    // GitHub's year total can differ from the sum of the day cells by one.
    expect(Math.abs(snapshot.totalContributions - counted)).toBeLessThanOrEqual(3);
    expect(activityTotal).toBe(snapshot.totalContributions);
    expect(snapshot.weeks.length).toBeGreaterThanOrEqual(52);
    expect(JSON.stringify(snapshot)).not.toMatch(/repository|repo/i);
    for (const week of snapshot.weeks) {
      for (const day of week.days) {
        expect(day.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(day.count).toBeGreaterThanOrEqual(0);
        expect(day.level).toBeGreaterThanOrEqual(0);
        expect(day.level).toBeLessThanOrEqual(4);
      }
    }
  });

  it("aligns days to Sunday and leaves later weekdays in a short week empty", () => {
    const columns = weekColumns(activityWeeks);
    const last = columns.at(-1);
    const endIndex = last?.findIndex((day) => day?.date === activityRange.end) ?? -1;

    expect(columns[0]?.[0]?.date).toBe(activityRange.start);
    expect(new Date(`${activityRange.start}T00:00:00Z`).getUTCDay()).toBe(0);
    expect(endIndex).toBeGreaterThanOrEqual(0);
    expect(last?.slice(endIndex + 1).every((day) => day === null)).toBe(true);
  });

  it("spaces month labels so neighboring names do not collide", () => {
    const labels = monthLabelColumns(activityWeeks);

    expect(labels.length).toBeGreaterThanOrEqual(8);
    expect(labels[0]).toEqual({ column: 0, label: "Nov" });
    for (let index = 1; index < labels.length; index += 1) {
      expect(labels[index].column - labels[index - 1].column).toBeGreaterThanOrEqual(3);
    }
  });

  it("drops a month label that would sit on the previous one", () => {
    const weeks: ActivityWeek[] = [
      { days: [{ date: "2026-01-04", count: 0, level: 0 }] },
      { days: [{ date: "2026-02-01", count: 0, level: 0 }] },
      { days: [{ date: "2026-02-08", count: 0, level: 0 }] },
      { days: [{ date: "2026-03-01", count: 1, level: 1 }] },
    ];

    expect(monthLabelColumns(weeks)).toEqual([
      { column: 0, label: "Jan" },
      { column: 3, label: "Mar" },
    ]);
  });

  it("formats the hover caption and the accessible summary", () => {
    expect(formatActivityCaption({ date: "2026-10-08", count: 12 })).toBe(
      "12 contributions on 8 Oct 2026",
    );
    expect(formatActivityCaption({ date: "2026-10-08", count: 1 })).toBe(
      "1 contribution on 8 Oct 2026",
    );
    expect(formatActivityCaption({ date: "2026-10-08", count: 0 })).toBe(
      "No contributions on 8 Oct 2026",
    );
    expect(activityAriaLabel(804, "2025-11-02", "2026-11-02")).toBe(
      "804 contributions in the last year, from 2 Nov 2025 to 2 Nov 2026.",
    );
  });
});
