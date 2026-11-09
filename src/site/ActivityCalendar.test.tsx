import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  activityDays,
  activityStats,
  activityTotal,
  activityWeeks,
  formatActivityCaption,
} from "@/data/activity";
import { ActivityCalendar } from "./ActivityCalendar";

beforeEach(() => {
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      constructor(callback: IntersectionObserverCallback) {
        queueMicrotask(() =>
          callback(
            [{ isIntersecting: true } as IntersectionObserverEntry],
            this as never,
          ),
        );
      }
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
    },
  );
});

describe("ActivityCalendar", () => {
  it("shows the year total, the day grid, and the folio legend", () => {
    render(<ActivityCalendar />);

    expect(
      screen.getByRole("link", {
        name: `${activityTotal} contributions in the last year`,
      }),
    ).toHaveAttribute("href", "https://github.com/csy20");
    expect(screen.getByRole("img")).toHaveAccessibleName(/contributions in the last year/i);
    expect(screen.getByText("Each square is a day.")).toBeInTheDocument();
    expect(screen.getByText("Less")).toBeInTheDocument();
    expect(screen.getByText("More")).toBeInTheDocument();
    expect(screen.getByText("Mon")).toBeInTheDocument();
    expect(screen.getByText("Wed")).toBeInTheDocument();
    expect(screen.getByText("Fri")).toBeInTheDocument();
    expect(
      screen.getByText("Days on GitHub. The list below is the upstream pull requests."),
    ).toBeInTheDocument();
    expect(screen.queryByText(/contribution settings/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/learn how we count/i)).not.toBeInTheDocument();
  });

  it("replaces the caption from the hovered day and keeps GitHub's level", () => {
    const day = activityWeeks
      .flatMap((week) => week.days)
      .find((item) => item.level === 4);
    if (!day) throw new Error("Snapshot has no fourth-quartile day.");

    render(<ActivityCalendar />);
    const cell = document.querySelector(`[data-date="${day.date}"]`);
    if (!(cell instanceof HTMLElement)) throw new Error("Missing activity cell.");

    expect(cell.className).toContain("bg-[var(--accent)]");
    fireEvent.mouseEnter(cell);
    expect(screen.getByText(formatActivityCaption(day))).toBeInTheDocument();
    expect(screen.queryByText("Each square is a day.")).not.toBeInTheDocument();

    fireEvent.mouseLeave(screen.getByRole("img"));
    expect(screen.getByText("Each square is a day.")).toBeInTheDocument();

    fireEvent.pointerDown(cell);
    expect(screen.getByText(formatActivityCaption(day))).toBeInTheDocument();
  });

  it("supports keyboard roving focus across days and surfaces active-day telemetry", () => {
    render(<ActivityCalendar />);
    expect(
      screen.getByText(new RegExp(`${activityStats.activeDays} active days`)),
    ).toBeInTheDocument();

    const lastDay = activityDays.at(-1)!;
    const prevDay = activityDays.at(-2)!;
    const lastCell = document.querySelector<HTMLElement>(
      `[data-date="${lastDay.date}"]`,
    )!;
    expect(lastCell).toHaveAttribute("tabindex", "0");

    fireEvent.focus(lastCell);
    expect(screen.getByText(formatActivityCaption(lastDay))).toBeInTheDocument();

    fireEvent.keyDown(screen.getByRole("img"), { key: "ArrowUp" });
    expect(screen.getByText(formatActivityCaption(prevDay))).toBeInTheDocument();
    expect(
      document.querySelector(`[data-date="${prevDay.date}"]`),
    ).toHaveAttribute("tabindex", "0");
  });
});
