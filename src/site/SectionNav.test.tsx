import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SectionNav } from "./SectionNav";

let trigger: (entries: Partial<IntersectionObserverEntry>[]) => void;

beforeEach(() => {
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      constructor(callback: IntersectionObserverCallback) {
        trigger = (entries) =>
          callback(entries as IntersectionObserverEntry[], this as never);
      }
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
    },
  );
  for (const id of ["projects", "open-source", "contact"]) {
    const section = document.createElement("section");
    section.id = id;
    document.body.appendChild(section);
  }
});

afterEach(() => {
  vi.unstubAllGlobals();
  document.body.innerHTML = "";
});

describe("SectionNav", () => {
  it("links to every section across viewports with nothing active at first", () => {
    render(<SectionNav />);

    const nav = screen.getByRole("navigation", { name: "Sections" });
    expect(nav).not.toHaveClass("hidden");
    expect(screen.getByText("OSS")).toHaveAttribute("aria-hidden", "true");

    expect(screen.getByRole("link", { name: "Work" })).toHaveAttribute("href", "#projects");
    expect(screen.getByRole("link", { name: "Open source" })).toHaveAttribute("href", "#open-source");
    expect(screen.getByRole("link", { name: "Contact" })).toHaveAttribute("href", "#contact");
    expect(document.querySelector("[aria-current]")).toBeNull();
  });

  it("marks the section in view and clears it when none is", () => {
    render(<SectionNav />);
    const target = document.getElementById("open-source")!;

    act(() => trigger([{ target, isIntersecting: true }]));
    expect(screen.getByRole("link", { name: "Open source" })).toHaveAttribute("aria-current", "location");
    expect(screen.getByRole("link", { name: "Work" })).not.toHaveAttribute("aria-current");

    act(() => trigger([{ target, isIntersecting: false }]));
    expect(document.querySelector("[aria-current]")).toBeNull();
  });
});
