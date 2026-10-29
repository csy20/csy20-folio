import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CountUp } from "./CountUp";

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

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("CountUp", () => {
  it("sets the final value immediately under prefers-reduced-motion", async () => {
    vi.spyOn(window, "matchMedia").mockImplementation(
      (query) =>
        ({
          matches: true,
          media: query,
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
        }) as unknown as MediaQueryList,
    );

    render(
      <p data-testid="stat">
        <CountUp to={23.6} decimals={1} />% less latency
      </p>,
    );

    await vi.waitFor(() => {
      const visible = screen
        .getByTestId("stat")
        .querySelector("span:not([aria-hidden])");
      expect(visible).toHaveTextContent("23.6");
    });
  });

  it("reserves the final formatted width via an aria-hidden sizer while inactive", () => {
    const { container } = render(<CountUp to={23.6} decimals={1} active={false} />);
    const sizer = container.querySelector('[aria-hidden="true"]');

    expect(sizer).toHaveTextContent("23.6");
    expect(sizer).toHaveClass("invisible");
  });
});
