import { config } from "@/config";
import { activityStats, activityTotal } from "@/data/activity";
import {
  contributionSnapshotDate,
  mergedContributions,
  mergedContributionSummary,
} from "@/data/contributions";
import { networkSites } from "@/data/network";
import {
  alsoProjects,
  featuredProjects,
  profile,
  resolveNote,
  speechRelayMetrics,
} from "@/data/siteContent";

function buildLlmsTxt(): string {
  const lines: string[] = [
    `# ${profile.name} (${profile.handle})`,
    "",
    `> ${profile.role} — ${profile.tagline}`,
    "",
    profile.heroDescription,
    "",
    "## Availability & Contact",
    `- Status: ${profile.availability}`,
    `- Portfolio: ${config.siteUrl}`,
    `- Email: ${config.email}`,
    `- Resume: ${config.siteUrl}${config.resumeUrl}`,
    `- GitHub: https://github.com/${config.githubUsername}`,
    `- Connected sites manifest: ${config.siteUrl}/ring.json`,
    "",
    "## Verified Highlights",
    `- Speech Relay (CPU profile, ${speechRelayMetrics.profile.utterances} utterances): ${speechRelayMetrics.profile.meanMs} ms mean / ${speechRelayMetrics.profile.p50Ms} ms p50 end-to-end (EN -> HI over WebRTC).`,
    `- Speech Relay (separate Silero-VAD A/B comparison): ${speechRelayMetrics.vadComparison.fixedWindowMs} ms fixed-window -> ${speechRelayMetrics.vadComparison.vadMs} ms VAD (-${speechRelayMetrics.vadComparison.reductionPercent}%).`,
    `- Open source (snapshot ${contributionSnapshotDate}): ${mergedContributionSummary.merged} merged upstream pull requests / Gerrit CLs across ${mergedContributionSummary.repositories} repositories.`,
    `- GitHub activity (last 12 months): ${activityTotal} contributions across ${activityStats.activeDays} active days (longest streak: ${activityStats.longestStreakDays} days; peak day: ${activityStats.maxDay.count}).`,
    "",
    "## Selected Work & Engineering Notes",
  ];

  for (const project of featuredProjects) {
    const linkList = project.links
      .map((link) => `${link.label}: ${link.href}`)
      .join(" | ");
    lines.push(
      `### ${project.title} (${project.eyebrow})`,
      `- Metric: ${project.metric}`,
      `- Stack: ${project.tags.join(", ")}`,
      `- Summary: ${project.description}`,
      ...(project.noteId
        ? [`- Engineering notes: ${config.siteUrl}/notes/${project.noteId}`]
        : []),
      `- Links: ${linkList}`,
    );
    if (project.noteId) {
      const resolved = resolveNote(project.noteId);
      if (resolved.kind === "case-study") {
        lines.push(`- Key decision: ${resolved.study.decision}`);
      }
    }
    lines.push("");
  }

  lines.push("## Also Built");
  for (const project of alsoProjects) {
    const link = project.links[0]?.href ?? "";
    lines.push(
      `- ${project.title} (${project.tags.slice(0, 4).join(", ")}): ${project.blurb}${link ? ` — ${link}` : ""}`,
    );
  }

  lines.push("", "## Merged Upstream Open Source");
  for (const record of mergedContributions) {
    lines.push(
      `- ${record.repository}#${record.number}: ${record.title} (${record.url})`,
    );
  }

  lines.push("", "## Connected Sites (/ring)");
  for (const site of networkSites) {
    lines.push(`- ${site.name} (${site.category}): ${site.url} — ${site.tagline}`);
  }

  lines.push("");
  return lines.join("\n");
}

export async function GET() {
  return new Response(buildLlmsTxt(), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
