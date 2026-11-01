import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { config } from "../config";
import { ThemeProvider } from "./ThemeProvider";
import { useTheme } from "./useTheme";

let systemScheme: "light" | "dark" = "dark";
const listeners = new Set<() => void>();

function mockColorScheme(initial: "light" | "dark") {
  systemScheme = initial;
  listeners.clear();
  vi.spyOn(window, "matchMedia").mockImplementation((query) => {
    const matches =
      (query === "(prefers-color-scheme: light)" && systemScheme === "light") ||
      (query === "(prefers-color-scheme: dark)" && systemScheme === "dark");
    return {
      matches,
      media: query,
      addEventListener: (_type: string, cb: () => void) => listeners.add(cb),
      removeEventListener: (_type: string, cb: () => void) => listeners.delete(cb),
    } as unknown as MediaQueryList;
  });
}

function Probe() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button type="button" onClick={() => toggleTheme()}>
      theme:{theme}
    </button>
  );
}

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  window.localStorage.clear();
  listeners.clear();
  vi.restoreAllMocks();
});

describe("ThemeProvider", () => {
  it("follows system color scheme when no override is stored and clears storage when toggled back to match OS", () => {
    mockColorScheme("light");
    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    );

    const btn = screen.getByRole("button");
    expect(btn).toHaveTextContent("theme:light");
    expect(window.localStorage.getItem(config.themeStorageKey)).toBeNull();

    // Toggling away from OS ("light" -> "dark") stores explicit override
    fireEvent.click(btn);
    expect(btn).toHaveTextContent("theme:dark");
    expect(window.localStorage.getItem(config.themeStorageKey)).toBe("dark");
    expect(document.documentElement).toHaveAttribute("data-theme", "dark");

    // Toggling back to match OS ("dark" -> "light") removes stored override
    fireEvent.click(btn);
    expect(btn).toHaveTextContent("theme:light");
    expect(window.localStorage.getItem(config.themeStorageKey)).toBeNull();

    // Subsequent OS change is followed automatically
    act(() => {
      systemScheme = "dark";
      listeners.forEach((cb) => cb());
    });
    expect(btn).toHaveTextContent("theme:dark");
  });
});
