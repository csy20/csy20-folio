import { act, fireEvent, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Opening } from "./Opening";

function mockReducedMotion(reduced: boolean) {
  vi.spyOn(window, "matchMedia").mockImplementation(
    (query) =>
      ({
        matches: reduced,
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }) as unknown as MediaQueryList,
  );
}

beforeEach(() => {
  vi.useFakeTimers();
  document.documentElement.classList.add("is-opening");
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  document.documentElement.classList.remove("is-opening");
});

describe("Opening", () => {
  it("skips itself and releases the page under reduced motion", () => {
    mockReducedMotion(true);
    const onLeave = vi.fn();
    const { container } = render(<Opening onLeave={onLeave} />);

    expect(container).toBeEmptyDOMElement();
    expect(onLeave).toHaveBeenCalledTimes(1);
    expect(document.documentElement).not.toHaveClass("is-opening");
  });

  it("can be skipped with Escape", () => {
    mockReducedMotion(false);
    const onLeave = vi.fn();
    render(<Opening onLeave={onLeave} />);
    expect(onLeave).not.toHaveBeenCalled();

    fireEvent.keyDown(window, { key: "Escape" });

    expect(onLeave).toHaveBeenCalledTimes(1);
    expect(document.documentElement).not.toHaveClass("is-opening");
  });

  it("leaves on its own after the opening sequence", () => {
    mockReducedMotion(false);
    const onLeave = vi.fn();
    render(<Opening onLeave={onLeave} />);

    act(() => {
      vi.advanceTimersByTime(1500);
    });

    expect(onLeave).toHaveBeenCalledTimes(1);
  });

  it("only leaves once when skipped and then timed out", () => {
    mockReducedMotion(false);
    const onLeave = vi.fn();
    render(<Opening onLeave={onLeave} />);

    fireEvent.keyDown(window, { key: "Enter" });
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(onLeave).toHaveBeenCalledTimes(1);
  });
});
