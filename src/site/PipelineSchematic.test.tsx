import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { speechRelayMetrics } from "@/data/siteContent";
import { SoundContext } from "@/dock/useSound";
import { PipelineSchematic, SPEECH_TRACE_EVENT } from "./PipelineSchematic";

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

afterEach(() => {
  vi.restoreAllMocks();
});

function mockReducedMotion(reduced: boolean) {
  vi.spyOn(window, "matchMedia").mockImplementation(
    (query) =>
      ({
        matches: reduced,
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }) as unknown as MediaQueryList,
  );
}

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
      screen.getByText(String(speechRelayMetrics.profile.meanMs)),
    ).toBeInTheDocument();
  });

  it("switches to VAD A/B comparison mode and shows measured savings under reduced motion", () => {
    mockReducedMotion(true);
    render(<PipelineSchematic />);

    fireEvent.click(screen.getByRole("button", { name: /VAD A\/B/i }));

    expect(screen.getByText(/Silero-VAD/)).toBeInTheDocument();
    expect(screen.getByText(/Fixed-window flush/)).toBeInTheDocument();
    expect(screen.getByText(/-1,111 ms \(-23\.6%\)/)).toBeInTheDocument();
    expect(screen.getByText("3,597 ms")).toBeInTheDocument();
    expect(screen.getByText("4,708 ms")).toBeInTheDocument();
  });

  it("responds to external trace dispatch and emits tactile ticks at 2× playback", () => {
    mockReducedMotion(false);
    const playDockTick = vi.fn();
    let rafCallback: FrameRequestCallback | null = null;
    vi.spyOn(performance, "now").mockReturnValue(1000);
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
      rafCallback = cb;
      return 1;
    });

    render(
      <SoundContext.Provider
        value={{ soundEnabled: true, toggleSound: vi.fn(), playDockTick }}
      >
        <PipelineSchematic />
      </SoundContext.Provider>,
    );

    act(() => {
      window.dispatchEvent(
        new CustomEvent(SPEECH_TRACE_EVENT, { detail: { mode: "trace" } }),
      );
    });

    expect(screen.getByRole("button", { name: /Running 2×/i })).toBeInTheDocument();
    expect(playDockTick).toHaveBeenCalled();

    // At 2x playback, 1300 ms wall-clock elapsed => 2600 simulated ms >= 2505 ms
    act(() => {
      rafCallback?.(2300);
    });

    expect(screen.getByRole("button", { name: /Replay \(2×\)/i })).toBeInTheDocument();
  });
});
