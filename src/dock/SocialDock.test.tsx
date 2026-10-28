import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SocialDock } from "./SocialDock";
import { SoundContext } from "./useSound";
import { ThemeContext } from "./useTheme";

afterEach(() => vi.restoreAllMocks());

function renderDock(canMagnify = false) {
  vi.spyOn(window, "matchMedia").mockImplementation(
    (query) =>
      ({
        matches: canMagnify,
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }) as unknown as MediaQueryList,
  );
  const playDockTick = vi.fn();
  const toggleTheme = vi.fn();
  render(
    <ThemeContext.Provider
      value={{ theme: "light", toggleTheme, setTheme: vi.fn() }}
    >
      <SoundContext.Provider
        value={{ soundEnabled: true, toggleSound: vi.fn(), playDockTick }}
      >
        <SocialDock />
      </SoundContext.Provider>
    </ThemeContext.Provider>,
  );
  return { playDockTick, toggleTheme };
}

describe("SocialDock audio interactions", () => {
  it.each([false, true])(
    "requests a mouse hover tick independently of magnification being %s",
    (canMagnify) => {
      const { playDockTick } = renderDock(canMagnify);
      fireEvent.pointerEnter(screen.getByRole("link", { name: "Home" }), {
        pointerType: "mouse",
      });
      expect(playDockTick).toHaveBeenCalledOnce();
    },
  );

  it("plays once for a touch tap without treating touch entry as a hover", () => {
    const { playDockTick } = renderDock();
    const home = screen.getByRole("link", { name: "Home" });
    fireEvent.pointerEnter(home, { pointerType: "touch" });
    expect(playDockTick).not.toHaveBeenCalled();
    fireEvent.click(home);
    expect(playDockTick).toHaveBeenCalledOnce();
  });

  it("plays for keyboard activation while preserving the theme action", async () => {
    const { playDockTick, toggleTheme } = renderDock();
    const user = userEvent.setup();
    screen.getByRole("button", { name: "Switch to dark theme" }).focus();
    await user.keyboard("{Enter}");
    expect(playDockTick).toHaveBeenCalledOnce();
    expect(toggleTheme).toHaveBeenCalledOnce();
  });
});
