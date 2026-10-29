import {
  useCallback,
  useLayoutEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import { ThemeContext, type Theme } from "./useTheme";
import { config } from "../config";

const themeEvent = "csy20-theme-change";

function subscribe(onChange: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key !== config.themeStorageKey && event.key !== null) return;
    onChange();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(themeEvent, onChange);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(themeEvent, onChange);
  };
}

function readTheme(): Theme {
  try {
    const stored = window.localStorage.getItem(config.themeStorageKey);
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    // Private browsing still gets the default theme.
  }
  return "dark";
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.setAttribute("data-theme", theme);
  root.style.colorScheme = theme;
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", theme === "light" ? "#f6f5f1" : "#0a0a0a");
}

function writeTheme(theme: Theme) {
  try {
    window.localStorage.setItem(config.themeStorageKey, theme);
  } catch {
    // The choice still applies for this visit.
  }
  applyTheme(theme);
  window.dispatchEvent(new Event(themeEvent));
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useSyncExternalStore(subscribe, readTheme, () => "dark" as Theme);

  useLayoutEffect(() => {
    applyTheme(readTheme());
  }, [theme]);

  const setTheme = useCallback((value: Theme) => {
    writeTheme(value);
  }, []);

  const toggleTheme = useCallback(() => {
    writeTheme(readTheme() === "dark" ? "light" : "dark");
  }, []);

  const value = useMemo(
    () => ({ theme, setTheme, toggleTheme }),
    [theme, setTheme, toggleTheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
