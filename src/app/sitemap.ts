import type { MetadataRoute } from "next";
import { config } from "@/config";
import { ENGINEERING_NOTE_IDS } from "@/data/siteContent";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: config.siteUrl, changeFrequency: "monthly", priority: 1 },
    ...ENGINEERING_NOTE_IDS.map((id) => ({
      url: `${config.siteUrl}/notes/${id}`,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
