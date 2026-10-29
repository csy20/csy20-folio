import { describe, expect, it } from "vitest";
import { projects, speechRelayMetrics } from "./siteContent";

describe("speechRelayMetrics", () => {
  it("derives the VAD reduction from the two measured latencies", () => {
    const { fixedWindowMs, vadMs, reductionPercent } =
      speechRelayMetrics.vadComparison;
    const computed = ((fixedWindowMs - vadMs) / fixedWindowMs) * 100;

    expect(Number(computed.toFixed(1))).toBe(reductionPercent);
  });

  it("keeps the project copy in sync with the shared figures", () => {
    const project = projects.find((item) => item.title === "Speech Relay");
    const { profile, vadComparison } = speechRelayMetrics;

    expect(project?.description).toContain(`${profile.meanMs} ms mean`);
    expect(project?.description).toContain(`${profile.p50Ms} ms p50`);
    expect(project?.description).toContain(`${vadComparison.reductionPercent}%`);
    expect(project?.spotlight).toBe(`${profile.meanMs} ms mean E2E`);
  });
});
