import snapshot from "./activity.generated.json";

const levels = [0, 1, 2, 3, 4] as const;

export type ActivityLevel = (typeof levels)[number];

export type ActivityDay = {
  date: string;
  count: number;
  level: ActivityLevel;
};

export type ActivityWeek = {
  days: readonly ActivityDay[];
};

const monthNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

function asLevel(value: number): ActivityLevel {
  const level = levels.find((item) => item === value);
  if (level === undefined) {
    throw new Error(`Invalid activity level: ${value}`);
  }
  return level;
}

export const activityGeneratedAt = snapshot.generatedAt;
export const activityAuthor = snapshot.author;
export const activityTotal = snapshot.totalContributions;

export const activityWeeks: readonly ActivityWeek[] = snapshot.weeks.map(
  (week) => ({
    days: week.days.map((day) => ({
      date: day.date,
      count: day.count,
      level: asLevel(day.level),
    })),
  }),
);

function utcWeekday(date: string) {
  return new Date(`${date}T00:00:00Z`).getUTCDay();
}

export function weekColumns(
  weeks: readonly ActivityWeek[],
): (ActivityDay | null)[][] {
  return weeks.map((week) => {
    const slots: (ActivityDay | null)[] = Array.from(
      { length: 7 },
      () => null,
    );
    for (const day of week.days) {
      slots[utcWeekday(day.date)] = day;
    }
    return slots;
  });
}

// Three columns is the narrowest gap that keeps a three-letter month
// from sitting on the previous label. Cell pitch is 12px in the calendar.
const monthLabelGap = 3;

export function monthLabelColumns(
  weeks: readonly ActivityWeek[],
): { column: number; label: string }[] {
  const seen = new Set<string>();
  const labels: { column: number; label: string }[] = [];
  let lastColumn = -999;

  weeks.forEach((week, column) => {
    for (const day of week.days) {
      const key = day.date.slice(0, 7);
      if (seen.has(key)) continue;
      seen.add(key);
      if (column - lastColumn < monthLabelGap) continue;
      const month = Number(day.date.slice(5, 7));
      labels.push({ column, label: monthNames[month - 1] ?? "" });
      lastColumn = column;
      break;
    }
  });

  return labels;
}

export function formatActivityDate(date: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}

export function formatActivityCaption(day: Pick<ActivityDay, "date" | "count">) {
  const when = formatActivityDate(day.date);
  if (day.count === 0) return `No contributions on ${when}`;
  if (day.count === 1) return `1 contribution on ${when}`;
  return `${day.count} contributions on ${when}`;
}

const activityStart = activityWeeks[0]?.days[0]?.date;
const activityEnd = activityWeeks.at(-1)?.days.at(-1)?.date;

if (!activityStart || !activityEnd) {
  throw new Error("Activity calendar is empty.");
}

export const activityRange = {
  start: activityStart,
  end: activityEnd,
};

export const activityDays: readonly ActivityDay[] = activityWeeks.flatMap(
  (week) => week.days,
);

export type ActivityStats = {
  activeDays: number;
  longestStreakDays: number;
  maxDay: ActivityDay;
};

export function summarizeActivityStats(
  weeks: readonly ActivityWeek[],
): ActivityStats {
  const days = weeks.flatMap((week) => week.days);
  if (days.length === 0) {
    throw new Error("Cannot summarize empty activity weeks.");
  }

  let activeDays = 0;
  let currentStreak = 0;
  let longestStreakDays = 0;
  let maxDay = days[0];

  for (const day of days) {
    if (day.count > 0) {
      activeDays += 1;
      currentStreak += 1;
      if (currentStreak > longestStreakDays) {
        longestStreakDays = currentStreak;
      }
    } else {
      currentStreak = 0;
    }

    if (day.count >= maxDay.count) {
      maxDay = day;
    }
  }

  return { activeDays, longestStreakDays, maxDay };
}

export const activityStats = summarizeActivityStats(activityWeeks);

export function activityAriaLabel(total: number, start: string, end: string) {
  const noun = total === 1 ? "contribution" : "contributions";
  return `${total} ${noun} in the last year, from ${formatActivityDate(start)} to ${formatActivityDate(end)}.`;
}
