import { describe, expect, it } from "vitest";
import { config } from "@/config";
import {
  NETWORK_NAME,
  NETWORK_SITE_IDS,
  getNetworkManifest,
  getNetworkSite,
  networkSites,
} from "./network";

describe("site network directory", () => {
  it("lists all 7 connected sites with unique ids and HTTPS URLs", () => {
    expect(networkSites).toHaveLength(7);
    expect(new Set(networkSites.map((site) => site.id)).size).toBe(7);
    expect(networkSites.map((site) => site.id)).toEqual([...NETWORK_SITE_IDS]);

    for (const site of networkSites) {
      expect(site.url.startsWith("https://")).toBe(true);
      expect(site.icon.startsWith("/")).toBe(true);
      expect(getNetworkSite(site.id)).toEqual(site);
    }
  });

  it("builds a manifest with absolute hub and icon URLs", () => {
    const manifest = getNetworkManifest();
    expect(manifest.name).toBe(NETWORK_NAME);
    expect(manifest.hub).toBe(`${config.siteUrl}/ring`);
    expect(manifest.sites).toHaveLength(networkSites.length);

    for (const site of manifest.sites) {
      expect(site.icon.startsWith(`${config.siteUrl}/`)).toBe(true);
    }
  });
});
