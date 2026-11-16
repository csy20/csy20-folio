import { execFileSync } from "node:child_process";
import { readFileSync, realpathSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const login = "csy20";
// Pin calendar boundaries to IST (+05:30) and the 53-week Sunday-to-today grid
// so UTC runner clocks and Sunday rollovers stay aligned with the rendered cells.
const timeZone = "Asia/Kolkata";
const istOffset = "+05:30";
const msPerDay = 86_400_000;

export function istCalendarWindow(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const year = Number(parts.find((part) => part.type === "year")?.value);
  const month = Number(parts.find((part) => part.type === "month")?.value);
  const day = Number(parts.find((part) => part.type === "day")?.value);

  const endUtc = Date.UTC(year, month - 1, day);
  const weekday = new Date(endUtc).getUTCDay();
  const startUtc = endUtc - (weekday + 52 * 7) * msPerDay;
  const startDate = new Date(startUtc).toISOString().slice(0, 10);
  const endDate = new Date(endUtc).toISOString().slice(0, 10);

  return {
    startDate,
    endDate,
    from: `${startDate}T00:00:00${istOffset}`,
    to: `${endDate}T23:59:59${istOffset}`,
  };
}

const query = `query($login: String!, $from: DateTime!, $to: DateTime!) {
  user(login: $login) {
    contributionsCollection(from: $from, to: $to) {
      contributionCalendar {
        totalContributions
        weeks {
          contributionDays {
            date
            contributionCount
            contributionLevel
          }
        }
      }
    }
  }
}`;

/** @type {Record<string, 0 | 1 | 2 | 3 | 4>} */
const levels = {
  NONE: 0,
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4,
};

/**
 * @param {{ totalContributions: number; weeks: { contributionDays: { date: string; contributionCount: number; contributionLevel: string }[] }[] }} calendar
 * @param {{ startDate: string; endDate: string }} window
 */
export function normalizeAndValidateCalendar(calendar, { startDate, endDate }) {
  const weeks = calendar.weeks.map((week) => ({
    days: week.contributionDays.map((day) => {
      const level = levels[day.contributionLevel];
      if (level === undefined) {
        throw new Error(`Unknown contribution level: ${day.contributionLevel}`);
      }
      if (!/^\d{4}-\d{2}-\d{2}$/.test(day.date)) {
        throw new Error(`Unexpected contribution date: ${day.date}`);
      }
      return {
        date: day.date,
        count: day.contributionCount,
        level,
      };
    }),
  }));

  if (weeks.length < 52) {
    throw new Error(`Expected at least 52 weeks, got ${weeks.length}.`);
  }

  const firstDate = weeks[0]?.days[0]?.date;
  const lastDate = weeks.at(-1)?.days.at(-1)?.date;
  if (firstDate !== startDate || lastDate !== endDate) {
    throw new Error(
      `Expected calendar bounds ${startDate}..${endDate}, got ${firstDate ?? "missing"}..${lastDate ?? "missing"}.`,
    );
  }

  const counted = weeks.reduce(
    (sum, week) => sum + week.days.reduce((inner, day) => inner + day.count, 0),
    0,
  );

  const gap = Math.abs(counted - calendar.totalContributions);
  // GitHub's headline sometimes disagrees with the sum of the day cells by
  // one. A wide gap means the payload was cut off, so keep that as a failure.
  if (gap > 3) {
    throw new Error(
      `Day counts add up to ${counted}, but GitHub reported ${calendar.totalContributions}.`,
    );
  }
  if (gap > 0) {
    console.warn(
      `GitHub total ${calendar.totalContributions} differs from the day sum ${counted} by ${gap}. Keeping GitHub's total.`,
    );
  }

  return weeks;
}

export function run() {
  const window = istCalendarWindow();
  const raw = execFileSync(
    "gh",
    [
      "api",
      "graphql",
      "-H",
      `Time-Zone: ${timeZone}`,
      "-f",
      `query=${query}`,
      "-f",
      `login=${login}`,
      "-f",
      `from=${window.from}`,
      "-f",
      `to=${window.to}`,
    ],
    {
      encoding: "utf8",
      env: { ...process.env, TZ: timeZone },
    },
  );

  const payload = JSON.parse(raw);
  if (payload.errors?.length) {
    throw new Error(
      payload.errors
        .map((/** @type {{ message: string }} */ error) => error.message)
        .join("\n"),
    );
  }

  const calendar = payload.data?.user?.contributionsCollection?.contributionCalendar;
  if (!calendar) {
    throw new Error("GitHub did not return a contribution calendar.");
  }

  const weeks = normalizeAndValidateCalendar(calendar, window);

  const destination = join(
    dirname(fileURLToPath(import.meta.url)),
    "../src/data/activity.generated.json",
  );

  let previous = null;
  try {
    previous = JSON.parse(readFileSync(destination, "utf8"));
  } catch {
    previous = null;
  }

  const unchanged =
    previous?.author === login &&
    previous?.totalContributions === calendar.totalContributions &&
    JSON.stringify(previous?.weeks) === JSON.stringify(weeks);

  const snapshot = {
    generatedAt: unchanged ? previous.generatedAt : new Date().toISOString(),
    author: login,
    totalContributions: calendar.totalContributions,
    weeks,
  };

  if (unchanged) {
    console.log(
      `${snapshot.totalContributions} contributions, ${weeks.length} weeks, unchanged`,
    );
  } else {
    writeFileSync(destination, `${JSON.stringify(snapshot, null, 2)}\n`);
    console.log(
      `${snapshot.totalContributions} contributions, ${weeks.length} weeks, written to ${destination}`,
    );
  }
}

const entryPoint = process.argv[1] ? realpathSync(process.argv[1]) : null;
if (entryPoint === fileURLToPath(import.meta.url)) {
  run();
}
