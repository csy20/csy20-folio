import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ContributionExplorer } from "./ContributionExplorer";

describe("ContributionExplorer", () => {
  it("renders All and every upstream repository as equal-weight filter pills", () => {
    render(<ContributionExplorer />);

    const group = screen.getByRole("group", {
      name: "Filter pull requests by repository",
    });
    const buttons = within(group).getAllByRole("button");

    expect(buttons).toHaveLength(7);
    expect(buttons[0]).toHaveTextContent("All11");
    expect(buttons[0]).toHaveAttribute("aria-pressed", "true");
    expect(buttons[1]).toHaveTextContent("semantica-agi/semantica6");
    expect(buttons[2]).toHaveTextContent("redhat-et/ripwire1");
    expect(buttons[3]).toHaveTextContent("internetarchive/openlibrary1");
  });

  it("filters merged pull requests by repository and resets cleanly", () => {
    render(<ContributionExplorer />);

    expect(screen.getByText("Show all 11")).toBeInTheDocument();

    const cogneePill = screen.getByRole("button", {
      name: /topoteretes\/cognee/i,
    });
    fireEvent.click(cogneePill);

    expect(cogneePill).toHaveAttribute("aria-pressed", "true");
    expect(screen.queryByText("Show all 11")).not.toBeInTheDocument();
    expect(
      screen.getByText(
        "fix(ingestion): keep WHERE clause for schema-qualified SQL tables",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /topoteretes\/cognee ↗/i }),
    ).toHaveAttribute(
      "href",
      expect.stringContaining(
        "https://github.com/topoteretes/cognee/pulls?q=",
      ),
    );

    // Clicking the active pill toggles back to All
    fireEvent.click(cogneePill);
    expect(cogneePill).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByText("Show all 11")).toBeInTheDocument();
  });
});
