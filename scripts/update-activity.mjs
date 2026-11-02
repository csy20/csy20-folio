import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
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

if (counted !== calendar.totalContributions) {
  throw new Error(
    `Day counts add up to ${counted}, but GitHub reported ${calendar.totalContributions}.`,
  );
}

const snapshot = {
  generatedAt: new Date().toISOString(),
  author: login,
  totalContributions: calendar.totalContributions,
  weeks,
};

const destination = join(
  dirname(fileURLToPath(import.meta.url)),
  "../src/data/activity.generated.json",
);

writeFileSync(destination, `${JSON.stringify(snapshot, null, 2)}\n`);
console.log(
  `${snapshot.totalContributions} contributions, ${weeks.length} weeks, written to ${destination}`,
);
