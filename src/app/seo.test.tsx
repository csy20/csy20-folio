import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { config } from "@/config";
import { ENGINEERING_NOTE_IDS, profile } from "@/data/siteContent";
import { Providers } from "@/site/Providers";
import EngineeringNotePage from "./notes/[id]/page";
import sitemap from "./sitemap";

describe("SEO metadata and structured data", () => {
  it("populates deterministic lastModified dates in sitemap.xml", () => {
    const entries = sitemap();
    expect(entries).toHaveLength(2 + ENGINEERING_NOTE_IDS.length);

    for (const entry of entries) {
      expect(entry.lastModified).toBeInstanceOf(Date);
      expect(Number.isNaN((entry.lastModified as Date).getTime())).toBe(false);
    }

    expect(entries[0]?.url).toBe(config.siteUrl);
    expect(entries[1]?.url).toBe(`${config.siteUrl}/ring`);
  });

  it("emits TechArticle and BreadcrumbList JSON-LD on engineering note pages", async () => {
    const view = await EngineeringNotePage({
      params: Promise.resolve({ id: "speech-relay" }),
    });
    const { container } = render(<Providers>{view}</Providers>);

    const scripts = Array.from(
      container.querySelectorAll('script[type="application/ld+json"]'),
    );
    expect(scripts).toHaveLength(2);

    const payloads = scripts.map((node) =>
      JSON.parse(node.textContent ?? "{}"),
    );
    const article = payloads.find((item) => item["@type"] === "TechArticle");
    const breadcrumb = payloads.find(
      (item) => item["@type"] === "BreadcrumbList",
    );

    expect(article).toBeDefined();
    expect(article.name).toBe("Speech Relay");
    expect(article.url).toBe(`${config.siteUrl}/notes/speech-relay`);
    expect(article.author["@id"]).toBe(`${config.siteUrl}/#person`);
    expect(article.author.name).toBe(profile.name);

    expect(breadcrumb).toBeDefined();
    expect(breadcrumb.itemListElement).toHaveLength(3);
    expect(breadcrumb.itemListElement[2].name).toBe("Speech Relay");
  });
});
