import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { mergedContributions } from "@/data/contributions";
import { SoundContext } from "@/dock/useSound";
import { CommandPalette, getContributionDomId } from "./CommandPalette";

afterEach(() => {
  vi.restoreAllMocks();
  document.body.innerHTML = "";
});

describe("CommandPalette", () => {
  it("toggles via Ctrl+K shortcut", () => {
    const onOpenChange = vi.fn();
    render(
      <CommandPalette
        open={false}
        onOpenChange={onOpenChange}
        onOpenNote={vi.fn()}
      />,
    );

    fireEvent.keyDown(window, { key: "k", ctrlKey: true });
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it("filters merged pull requests and expands nested PR details on Enter", () => {
    // Pick a PR that is not in the top 3 featured PRs (e.g. cognee or breakscale or another semantica PR)
    const targetPr =
      mergedContributions.find((item) => item.repository.includes("cognee")) ??
      mergedContributions[0];

    const outer = document.createElement("details");
    outer.id = "more-contributions-details";
    const inner = document.createElement("details");
    inner.id = getContributionDomId(targetPr);
    inner.scrollIntoView = vi.fn();
    const summary = document.createElement("summary");
    inner.appendChild(summary);
    outer.appendChild(inner);
    document.body.appendChild(outer);

    const onOpenChange = vi.fn();
    const playDockTick = vi.fn();

    render(
      <SoundContext.Provider
        value={{ soundEnabled: true, toggleSound: vi.fn(), playDockTick }}
      >
        <CommandPalette
          open={true}
          onOpenChange={onOpenChange}
          onOpenNote={vi.fn()}
        />
      </SoundContext.Provider>,
    );

    const input = screen.getByRole("combobox");
    fireEvent.change(input, {
      target: { value: `${targetPr.repository}#${targetPr.number}` },
    });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(playDockTick).toHaveBeenCalled();
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(outer.open).toBe(true);
    expect(inner.open).toBe(true);
  });

  it("copies email address and shows confirmation", () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });

    render(
      <CommandPalette
        open={true}
        onOpenChange={vi.fn()}
        onOpenNote={vi.fn()}
      />,
    );

    const input = screen.getByRole("combobox");
    fireEvent.change(input, { target: { value: "copy email" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(writeText).toHaveBeenCalledWith("chitreshy20@gmail.com");
    expect(screen.getByText("Copied!")).toBeInTheDocument();
  });
});
