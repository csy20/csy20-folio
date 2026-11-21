import { config } from "@/config";

export const NETWORK_NAME = "csy20 sites";

export const NETWORK_SITE_IDS = [
  "csy20",
  "02-os",
  "bytewise",
  "nen",
  "learnllm",
  "contribute-pulse",
  "premium-taste",
] as const;

export type NetworkSiteId = (typeof NETWORK_SITE_IDS)[number];

export type NetworkSite = {
  id: NetworkSiteId;
  name: string;
  domain: string;
  url: string;
  tagline: string;
  category: string;
  icon: string;
  iconWell: "dark" | "light" | "photo";
};

export const networkSites: readonly NetworkSite[] = [
  {
    id: "csy20",
    name: "csy20.me",
    domain: "csy20.me",
    url: "https://csy20.me",
    tagline: "Portfolio, engineering notes, and open-source work.",
    category: "Portfolio",
    icon: "/portrait-twitter-256.webp",
    iconWell: "photo",
  },
  {
    id: "02-os",
    name: "02_OS",
    domain: "02os.xyz",
    url: "https://02os.xyz",
    tagline:
      "Linux workstation for coding agents with local context and sandboxed verification.",
    category: "Operating System",
    icon: "/logos/02-os.svg",
    iconWell: "light",
  },
  {
    id: "bytewise",
    name: "ByteWise",
    domain: "bytewise.lol",
    url: "https://bytewise.lol",
    tagline: "Offline-first developer library and DSA lessons for Android.",
    category: "Android App",
    icon: "/bytewise-logo.png",
    iconWell: "dark",
  },
  {
    id: "nen",
    name: "Nen",
    domain: "trynen.xyz",
    url: "https://trynen.xyz",
    tagline: "Lightweight offline music player for Android. No ads or account.",
    category: "Android App",
    icon: "/nen-logo.png",
    iconWell: "light",
  },
  {
    id: "learnllm",
    name: "LearnLLM",
    domain: "learnllm.online",
    url: "https://learnllm.online",
    tagline: "Hands-on LLM engineering labs across inference, RAG, LoRA, and MCP.",
    category: "Curriculum",
    icon: "/logos/learnllm.svg",
    iconWell: "dark",
  },
  {
    id: "contribute-pulse",
    name: "Contribute Pulse",
    domain: "contribute-pulse.vercel.app",
    url: "https://contribute-pulse.vercel.app/",
    tagline: "Find active open-source repositories that review pull requests.",
    category: "Web Tool",
    icon: "/logos/contribute-pulse.svg",
    iconWell: "dark",
  },
  {
    id: "premium-taste",
    name: "Premium Taste",
    domain: "02-os.github.io/premium-taste",
    url: "https://02-os.github.io/premium-taste/",
    tagline: "UI judgment system, static HTML auditor, and MCP server for agents.",
    category: "Design System",
    icon: "/logos/premium-taste.png",
    iconWell: "light",
  },
] as const;

export function getNetworkSite(id: NetworkSiteId): NetworkSite {
  const site = networkSites.find((entry) => entry.id === id);
  if (!site) {
    throw new Error(`Unknown network site: ${id}`);
  }
  return site;
}

export function getNetworkManifest() {
  return {
    name: NETWORK_NAME,
    owner: "Chitresh Yadav",
    hub: `${config.siteUrl}/ring`,
    sites: networkSites.map((site) => ({
      id: site.id,
      name: site.name,
      domain: site.domain,
      url: site.url,
      tagline: site.tagline,
      category: site.category,
      icon: `${config.siteUrl}${site.icon}`,
      iconWell: site.iconWell,
    })),
  };
}
