import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { networkSites } from "@/data/network";
import { SoundContext } from "@/dock/useSound";
import { SiteNetwork } from "./SiteNetwork";

describe("SiteNetwork", () => {
  it("renders all 7 site medallions with current-site state and external attributes", () => {
    render(<SiteNetwork currentSiteId="csy20" />);

    const hub = screen.getByRole("link", {
      name: "View all 7 connected sites",
    });
    expect(hub).toHaveAttribute("href", "/ring");

    const currentLink = screen.getByRole("link", {
      name: "csy20.me — current site",
    });
    expect(currentLink).toHaveAttribute("aria-current", "page");
    expect(currentLink).toHaveAttribute("href", "#hero");

    for (const site of networkSites.filter((entry) => entry.id !== "csy20")) {
      const link = screen.getByRole("link", {
        name: `${site.name} — ${site.domain} (opens in a new tab)`,
      });
      expect(link).toHaveAttribute("href", site.url);
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    }

    expect(screen.queryByText("prev")).not.toBeInTheDocument();
    expect(screen.queryByText("next")).not.toBeInTheDocument();
  });

  it("plays dock tick on mouse hover and dismisses tooltips on Escape", () => {
    const playDockTick = vi.fn();
    const { container } = render(
      <SoundContext.Provider
        value={{
          soundEnabled: true,
          toggleSound: vi.fn(),
          playDockTick,
        }}
      >
        <SiteNetwork currentSiteId="csy20" />
      </SoundContext.Provider>,
    );

    const bytewise = screen.getByRole("link", {
      name: "ByteWise — bytewise.lol (opens in a new tab)",
    });

    fireEvent.pointerEnter(bytewise, { pointerType: "mouse" });
    expect(playDockTick).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(bytewise, { key: "Escape" });
    expect(container.querySelector(".network-stack")).toHaveClass(
      "is-dismissed",
    );

    fireEvent.focus(bytewise);
    expect(container.querySelector(".network-stack")).not.toHaveClass(
      "is-dismissed",
    );
  });
});
