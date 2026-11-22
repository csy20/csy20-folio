import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { XRayToggle } from "./XRayMode";

afterEach(() => {
  document.documentElement.removeAttribute("data-xray");
});

describe("XRayToggle", () => {
  it("toggles blueprint X-Ray attribute on click and peek-activates on Alt key", () => {
    render(<XRayToggle />);

    const button = screen.getByRole("button", {
      name: "Enable architecture X-Ray blueprint",
    });
    expect(document.documentElement.getAttribute("data-xray")).toBeNull();

    fireEvent.click(button);
    expect(document.documentElement.getAttribute("data-xray")).toBe("on");
    expect(button).toHaveAttribute("aria-pressed", "true");

    fireEvent.keyDown(window, { key: "Escape" });
    expect(document.documentElement.getAttribute("data-xray")).toBeNull();

    fireEvent.keyDown(window, { key: "Alt" });
    expect(document.documentElement.getAttribute("data-xray")).toBe("on");

    fireEvent.keyUp(window, { key: "Alt" });
    expect(document.documentElement.getAttribute("data-xray")).toBeNull();
  });
});
