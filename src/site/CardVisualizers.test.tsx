import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BytewiseCacheStrip, NenEnvelopeMeter } from "./CardVisualizers";

describe("CardVisualizers", () => {
  it("toggles Nen track envelope preview between calm and playing states", () => {
    render(<NenEnvelopeMeter />);

    const toggle = screen.getByRole("button", {
      name: "Play track envelope preview",
    });
    expect(toggle).toHaveTextContent("Play");

    fireEvent.click(toggle);
    expect(
      screen.getByRole("button", { name: "Pause track envelope preview" }),
    ).toHaveTextContent("Pause");
    expect(screen.getByText("envelope · playing")).toBeInTheDocument();
  });

  it("toggles Bytewise offline cache readout between RAM and Drift/SQLite", () => {
    render(<BytewiseCacheStrip />);

    const toggle = screen.getByRole("button", {
      name: "Toggle offline cache read layer",
    });
    expect(toggle).toHaveTextContent("hot · offline");

    fireEvent.click(toggle);
    expect(toggle).toHaveTextContent("drift · persisted");
  });
});
