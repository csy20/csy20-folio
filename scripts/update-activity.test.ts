import { describe, expect, it } from "vitest";
import {
  istCalendarWindow,
  normalizeAndValidateCalendar,
} from "./update-activity.mjs";

function makeWeeks(startDate: string, totalDays: number, count = 0) {
  const startMs = new Date(`${startDate}T00:00:00Z`).getTime();
  const weeks: {
    contributionDays: {
      date: string;
      contributionCount: number;
      contributionLevel: string;
    }[];
  }[] = [];

  for (let offset = 0; offset < totalDays; offset += 1) {
    if (offset % 7 === 0) {
      weeks.push({ contributionDays: [] });
    }
    const date = new Date(startMs + offset * 86_400_000)
      .toISOString()
      .slice(0, 10);
    weeks.at(-1)?.contributionDays.push({
      date,
      contributionCount: offset === 0 ? count : 0,
      contributionLevel: offset === 0 && count > 0 ? "FIRST_QUARTILE" : "NONE",
    });
  }

  return weeks;
}

describe("update-activity IST window and validation", () => {
  it("rolls over exactly at 00:00 IST (18:30 UTC) and starts 52 weeks earlier on Sunday", () => {
    const beforeMidnightIst = new Date("2026-11-14T18:29:59Z");
    const atMidnightIst = new Date("2026-11-14T18:30:00Z");

    expect(istCalendarWindow(beforeMidnightIst)).toEqual({
      startDate: "2025-11-09",
      endDate: "2026-11-14",
      from: "2025-11-09T00:00:00+05:30",
      to: "2026-11-14T23:59:59+05:30",
    });
    expect(istCalendarWindow(atMidnightIst)).toEqual({
      startDate: "2025-11-16",
      endDate: "2026-11-15",
      from: "2025-11-16T00:00:00+05:30",
      to: "2026-11-15T23:59:59+05:30",
    });
  });

  it("keeps a Sunday start across leap years and full weeks", () => {
    const leapSaturdayIst = new Date("2025-03-01T12:00:00Z");
    const window = istCalendarWindow(leapSaturdayIst);

    expect(window.startDate).toBe("2024-02-25");
    expect(window.endDate).toBe("2025-03-01");
    expect(new Date(`${window.startDate}T00:00:00Z`).getUTCDay()).toBe(0);
  });

  it("rejects truncated date bounds or out-of-range day sums", () => {
    const window = istCalendarWindow(new Date("2026-11-14T19:00:00Z"));
    const weeks = makeWeeks(window.startDate, 365, 5);

    expect(
      normalizeAndValidateCalendar({ totalContributions: 5, weeks }, window),
    ).toHaveLength(53);

    expect(() =>
      normalizeAndValidateCalendar(
        { totalContributions: 17, weeks },
        window,
      ),
    ).toThrow(/Day counts add up to 5, but GitHub reported 17/);

    expect(() =>
      normalizeAndValidateCalendar(
        {
          totalContributions: 5,
          weeks: makeWeeks(window.startDate, 364, 5),
        },
        window,
      ),
    ).toThrow(/Expected calendar bounds 2025-11-16\.\.2026-11-15/);
  });
});
