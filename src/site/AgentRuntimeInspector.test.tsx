import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AgentRuntimeInspector } from "./AgentRuntimeInspector";

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("AgentRuntimeInspector", () => {
  it("transitions from clean to stale on git edit and incrementally re-parses the dirty file", () => {
    vi.useFakeTimers();
    render(<AgentRuntimeInspector />);

    expect(screen.getByText(/HEAD synced/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Simulate git edit" }));
    expect(screen.getByText(/staleness gate holds cached facts/i)).toBeInTheDocument();
    expect(screen.getByText("stale +14 -3")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Re-parse & serve" }));
    expect(screen.getByRole("button", { name: "Parsing…" })).toBeDisabled();

    act(() => {
      vi.advanceTimersByTime(400);
    });

    expect(screen.getByText(/MCP get_context → fresh/i)).toBeInTheDocument();
    expect(screen.getByText("re-parsed")).toBeInTheDocument();
  });
});
