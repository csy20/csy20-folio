import type { MetadataRoute } from "next";
import { config } from "@/config";
import { activityGeneratedAt } from "@/data/activity";
import { contributionSnapshot } from "@/data/contributions";
import { ENGINEERING_NOTE_IDS, notesLastModified } from "@/data/siteContent";

export default function sitemap(): MetadataRoute.Sitemap {
  const homeLastModified = new Date(
    Math.max(
      Date.parse(activityGeneratedAt),
      Date.parse(contributionSnapshot.generatedAt),
    ),
  );
  const notesDate = new Date(notesLastModified);

  return [
    {
      url: config.siteUrl,
      lastModified: homeLastModified,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${config.siteUrl}/ring`,
      lastModified: notesDate,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    ...ENGINEERING_NOTE_IDS.map((id) => ({
      url: `${config.siteUrl}/notes/${id}`,
      lastModified: notesDate,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
