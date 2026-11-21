import { describe, expect, it } from "vitest";
import {
  ENGINEERING_NOTE_IDS,
  alsoProjects,
  caseStudies,
  featuredProjects,
  playStoreProjectSummary,
  playStoreProjects,
  productSpotlights,
  profile,
  projects,
  speechRelayMetrics,
} from "./siteContent";

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
    expect(project?.blurb).toContain(`${vadComparison.reductionPercent}%`);
    expect(project?.metric).toBe(`${profile.meanMs} ms mean · ${profile.p50Ms} ms p50`);
    expect(project?.spotlight).toBe(`${profile.meanMs} ms mean E2E`);
  });
});

describe("projects metadata", () => {
  it("assigns unique slugs and resolves every featured noteId", () => {
    expect(new Set(projects.map((p) => p.slug)).size).toBe(projects.length);
    expect(featuredProjects.map((p) => p.title)).toEqual([
      "Speech Relay",
      "02_OS",
      "Bytewise",
      "Nen",
    ]);
    expect(alsoProjects.map((p) => p.title)).toEqual([
      "Speech Relay Rust",
      "MediaPipe AI",
      "Router Agent",
      "Warrant",
    ]);

    for (const project of featuredProjects) {
      expect(project.noteId).toBeDefined();
      expect(ENGINEERING_NOTE_IDS).toContain(project.noteId);
      const hasNote =
        caseStudies.some((study) => study.id === project.noteId) ||
        productSpotlights.some((spotlight) => spotlight.id === project.noteId);
      expect(hasNote).toBe(true);
    }

    for (const project of alsoProjects) {
      expect(project.alsoLine).toBeTruthy();
      expect(project.noteId).toBeUndefined();
    }
  });

  it("derives Play Store apps and card presentation flags from siteContent", () => {
    expect(playStoreProjects.map((project) => project.slug)).toEqual([
      "bytewise",
      "nen",
    ]);
    expect(playStoreProjectSummary).toBe("Bytewise and Nen");

    const os = projects.find((project) => project.slug === "02-os");
    expect(os?.logoWell).toBe("white");
    expect(os?.showTags).toBe(true);
    expect(os?.links).toEqual([{ label: "Website", href: "https://02os.xyz" }]);

    expect(profile.tagline).toBeTruthy();
    for (const language of profile.strapline.split(" · ")) {
      expect(profile.knowsAbout).toContain(language);
    }
  });
});
