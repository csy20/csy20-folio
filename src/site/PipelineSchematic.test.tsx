import { render, screen, within } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { speechRelayMetrics } from "@/data/siteContent";
import { PipelineSchematic } from "./PipelineSchematic";

beforeAll(() => {
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
    },
  );
});

describe("PipelineSchematic", () => {
  it("lists every hop of the pipeline in order", () => {
    render(<PipelineSchematic />);
    const hops = within(screen.getByRole("list")).getAllByRole("listitem");

    expect(hops.map((hop) => hop.textContent)).toEqual([
      "Mic",
      "VAD",
      "ASR",
      "MT",
      "TTS",
      "WebRTC out",
    ]);
  });

  it("describes the measured mean latency from the shared metrics", () => {
    render(<PipelineSchematic />);
    const label = `${speechRelayMetrics.profile.meanMs} ms mean end to end`;

    expect(screen.getByRole("figure")).toHaveAccessibleName(
      expect.stringContaining(label),
    );
    expect(
      screen.getByText(String(speechRelayMetrics.profile.meanMs), { exact: false }),
    ).toBeInTheDocument();
  });
});
