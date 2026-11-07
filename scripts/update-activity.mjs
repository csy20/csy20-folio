import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const login = "csy20";

const query = `query($login: String!) {
  user(login: $login) {
    contributionsCollection {
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

const levels = {
  NONE: 0,
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4,
};

const raw = execFileSync(
  "gh",
  ["api", "graphql", "-f", `query=${query}`, "-f", `login=${login}`],
  { encoding: "utf8" },
);

const payload = JSON.parse(raw);
if (payload.errors?.length) {
  throw new Error(payload.errors.map((error) => error.message).join("\n"));
}

const calendar = payload.data?.user?.contributionsCollection?.contributionCalendar;
if (!calendar) {
  throw new Error("GitHub did not return a contribution calendar.");
}

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
