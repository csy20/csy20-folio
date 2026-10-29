import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { IndiaClock } from "./IndiaClock";

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("IndiaClock", () => {
  it("shows Asia/Kolkata time with seconds", () => {
    // 10:00:42 UTC is 15:30:42 in India (UTC+5:30).
    vi.setSystemTime(new Date("2026-10-30T10:00:42Z"));
    render(<IndiaClock />);

    const clock = screen.getByLabelText("15:30 India Standard Time");
    expect(clock).toHaveTextContent("15:30:42");
    expect(clock).toHaveTextContent("IST");
  });

  it("ticks forward each second", () => {
    vi.setSystemTime(new Date("2026-10-30T10:00:42Z"));
    render(<IndiaClock />);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getByRole("time")).toHaveTextContent("15:30:43");
  });
});
