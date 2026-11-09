import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PageTelemetry } from "./PageTelemetry";

describe("PageTelemetry", () => {
  it("renders a telemetry pill and expands live DOM and zero-runtime-API stats on click", () => {
    render(<PageTelemetry />);

    const toggle = screen.getByRole("button", {
      name: "Toggle live page telemetry",
    });
    expect(toggle).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");

    const list = screen.getByLabelText("Live page telemetry metrics");
    expect(list).toHaveTextContent("DOM");
    expect(list).toHaveTextContent("0 runtime");
  });
});
