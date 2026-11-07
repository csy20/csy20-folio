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

    expect(buttons).toHaveLength(8);
    expect(buttons[0]).toHaveTextContent("All14");
    expect(buttons[0]).toHaveAttribute("aria-pressed", "true");
    expect(buttons[1]).toHaveTextContent("semantica-agi/semantica7");
    expect(buttons[2]).toHaveTextContent("dart-lang/sdk2");
    expect(buttons[3]).toHaveTextContent("redhat-et/ripwire1");
    expect(buttons[4]).toHaveTextContent("internetarchive/openlibrary1");
  });

  it("filters merged pull requests by repository and resets cleanly", () => {
    render(<ContributionExplorer />);

    expect(screen.getByText("Show all 14")).toBeInTheDocument();

    const cogneePill = screen.getByRole("button", {
      name: /topoteretes\/cognee/i,
    });
    fireEvent.click(cogneePill);

    expect(cogneePill).toHaveAttribute("aria-pressed", "true");
    expect(screen.queryByText("Show all 14")).not.toBeInTheDocument();
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
    expect(screen.getByText("Show all 14")).toBeInTheDocument();
  });

  it("links Dart SDK contributions to Gerrit review", () => {
    render(<ContributionExplorer />);

    const dartPill = screen.getByRole("button", {
      name: /dart-lang\/sdk/i,
    });
    fireEvent.click(dartPill);

    expect(
      screen.getByText(
        "[analysis_server] Add a fix for use_is_even_rather_than_modulo",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "[analysis_server] Test highlighting of directives in part files",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /dart-lang\/sdk ↗/i }),
    ).toHaveAttribute(
      "href",
      expect.stringContaining("https://dart-review.googlesource.com/"),
    );
  });
});
