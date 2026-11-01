import {
  useCallback,
  useLayoutEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import {
  ThemeContext,
  type Theme,
  type ThemeTransitionOrigin,
} from "./useTheme";
import { config } from "../config";

const themeEvent = "csy20-theme-change";

type ViewTransitionLike = {
  ready: Promise<void>;
  finished: Promise<void>;
};

type DocumentWithViewTransition = Document & {
  startViewTransition?: (callback: () => void) => ViewTransitionLike;
};

function getSystemTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  try {
    const media = window.matchMedia("(prefers-color-scheme: light)");
    if (media.matches) return "light";
    const darkMedia = window.matchMedia("(prefers-color-scheme: dark)");
    if (darkMedia.matches) return "dark";
  } catch {
    // Fall back to dark when matchMedia is unavailable.
  }
  return "dark";
}

function subscribe(onChange: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key !== config.themeStorageKey && event.key !== null) return;
    onChange();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(themeEvent, onChange);

  let darkMedia: MediaQueryList | null = null;
  let lightMedia: MediaQueryList | null = null;
  try {
    darkMedia = window.matchMedia("(prefers-color-scheme: dark)");
    lightMedia = window.matchMedia("(prefers-color-scheme: light)");
    darkMedia.addEventListener?.("change", onChange);
    lightMedia.addEventListener?.("change", onChange);
  } catch {
    // Ignore environments without matchMedia listeners.
  }

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(themeEvent, onChange);
    darkMedia?.removeEventListener?.("change", onChange);
    lightMedia?.removeEventListener?.("change", onChange);
  };
}

function readStoredOverride(): Theme | null {
  try {
    const stored = window.localStorage.getItem(config.themeStorageKey);
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    // Private browsing falls back to system preference.
  }
  return null;
}

export function readTheme(): Theme {
  return readStoredOverride() ?? getSystemTheme();
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.setAttribute("data-theme", theme);
  root.style.colorScheme = theme;
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", theme === "light" ? "#f6f5f1" : "#0a0a0a");
}

function persistThemeChoice(next: Theme) {
  const system = getSystemTheme();
  try {
    if (next === system) {
      window.localStorage.removeItem(config.themeStorageKey);
    } else {
      window.localStorage.setItem(config.themeStorageKey, next);
    }
  } catch {
    // The choice still applies for this visit.
  }
  applyTheme(next);
  window.dispatchEvent(new Event(themeEvent));
}

function prefersReducedMotion(): boolean {
  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}

function transitionTheme(next: Theme, origin?: ThemeTransitionOrigin) {
  const doc = document as DocumentWithViewTransition;
  const canAnimate =
    Boolean(origin) &&
    typeof doc.startViewTransition === "function" &&
    typeof document.documentElement.animate === "function" &&
    !prefersReducedMotion();

  if (!canAnimate || !origin || !doc.startViewTransition) {
    persistThemeChoice(next);
    return;
  }

  const { x, y } = origin;
  const endRadius = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y),
  );

  const root = document.documentElement;
  root.classList.add("is-theme-transitioning");

  try {
    const transition = doc.startViewTransition(() => {
      persistThemeChoice(next);
    });

    transition.ready
      .then(() => {
        root.animate(
          {
            clipPath: [
              `circle(0px at ${x}px ${y}px)`,
              `circle(${endRadius}px at ${x}px ${y}px)`,
            ],
          },
          {
            duration: 420,
            easing: "cubic-bezier(0.22, 1, 0.36, 1)",
            pseudoElement: "::view-transition-new(root)",
          },
        );
      })
      .catch(() => {});

    transition.finished
      .catch(() => {})
      .finally(() => {
        root.classList.remove("is-theme-transitioning");
      });
  } catch {
    root.classList.remove("is-theme-transitioning");
    persistThemeChoice(next);
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useSyncExternalStore(
    subscribe,
    readTheme,
    () => "dark" as Theme,
  );

  useLayoutEffect(() => {
    applyTheme(readTheme());
  }, [theme]);

  const setTheme = useCallback((value: Theme) => {
    persistThemeChoice(value);
  }, []);

  const toggleTheme = useCallback((origin?: ThemeTransitionOrigin) => {
    const next: Theme = readTheme() === "dark" ? "light" : "dark";
    transitionTheme(next, origin);
  }, []);

  const value = useMemo(
    () => ({ theme, setTheme, toggleTheme }),
    [theme, setTheme, toggleTheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
