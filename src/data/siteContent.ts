import { config } from "../config";

export const ENGINEERING_NOTE_IDS = [
  "speech-relay",
  "02-os",
  "bytewise",
  "nen",
] as const;

export type EngineeringNoteId = (typeof ENGINEERING_NOTE_IDS)[number];

export type ProjectLink = {
  label: string;
  href: string;
};

export type ProjectPlacement = "featured-wide" | "featured" | "also";

export type Project = {
  slug: string;
  title: string;
  eyebrow: string;
  description: string;
  blurb: string;
  metric: string;
  alsoLine?: string;
  placement: ProjectPlacement;
  noteId?: EngineeringNoteId;
  tags: string[];
  links: ProjectLink[];
  logo?: string;
  spotlight?: string;
  releaseNote?: string;
};

export type PortraitId = "twitter";

export type Portrait = {
  id: PortraitId;
  src: string;
  label: string;
  alt: string;
};

export type SocialIcon =
  | "github"
  | "linkedin"
  | "x"
  | "email"
  | "youtube"
  | "instagram"
  | "threads";

export type SocialLink = {
  label: string;
  href: string;
  icon: SocialIcon;
  detail: string;
};

/**
 * Speech Relay figures. The CPU profile and the VAD comparison are separate
 * measurements, so they stay separate here.
 */
export const speechRelayMetrics = {
  /** CPU profile across 11 utterances. */
  profile: { meanMs: 2505, p50Ms: 2580, utterances: 11 },
  /** Separate comparison: fixed-window baseline vs Silero-VAD. */
  vadComparison: { fixedWindowMs: 4708, vadMs: 3597, reductionPercent: 23.6 },
} as const;

export const profile = {
  name: "Chitresh Yadav",
  handle: "csy20",
  role: "Backend · Applied ML",
  strapline: "Python · Rust · TypeScript",
  heroDescription:
    "I build backend systems and turn machine learning into working products. From realtime speech to local agents, I care about what ships — and how well it runs.",
  availability: "Open to SDE-1 / Backend / Applied ML roles.",
};

export const portraits: Record<PortraitId, Portrait> = {
  twitter: {
    id: "twitter",
    src: "/portrait-twitter.jpg",
    label: "X",
    alt: "Illustrated portrait of Chitresh Yadav",
  },
};

export const projects: Project[] = [
  {
    slug: "speech-relay",
    title: "Speech Relay",
    eyebrow: "Realtime speech-to-speech",
    description:
      `Streaming ASR → MT → TTS over WebRTC (EN→HI). A CPU profile measured ${speechRelayMetrics.profile.meanMs} ms mean / ${speechRelayMetrics.profile.p50Ms} ms p50 across ${speechRelayMetrics.profile.utterances} utterances. In a separate VAD comparison, mean latency fell from ${speechRelayMetrics.vadComparison.fixedWindowMs} ms to ${speechRelayMetrics.vadComparison.vadMs} ms (${speechRelayMetrics.vadComparison.reductionPercent}%). One shared ASR stream fans out to multiple listeners; a WER/CER eval harness tracks recognition quality.`,
    blurb:
      `Streaming ASR → MT → TTS over WebRTC, English to Hindi. Silero-VAD cut a separate comparison from ${speechRelayMetrics.vadComparison.fixedWindowMs} ms mean to ${speechRelayMetrics.vadComparison.vadMs} ms, ${speechRelayMetrics.vadComparison.reductionPercent}% lower.`,
    metric: `${speechRelayMetrics.profile.meanMs} ms mean · ${speechRelayMetrics.profile.p50Ms} ms p50`,
    placement: "featured-wide",
    noteId: "speech-relay",
    tags: [
      "Python",
      "faster-whisper",
      "IndicTrans2",
      "WebRTC",
      "ONNX",
      "asyncio",
    ],
    logo: "/logos/speech-relay.svg",
    spotlight: `${speechRelayMetrics.profile.meanMs} ms mean E2E`,
    releaseNote:
      "Silero-VAD replaced fixed-window flushing. Benchmark context and results are linked in the engineering notes.",
    links: [
      {
        label: "GitHub",
        href: "https://github.com/csy20/speech-relay",
      },
    ],
  },
  {
    slug: "02-os",
    title: "02_OS",
    eyebrow: "Agent-native desktop",
    description:
      "GNOME desktop with the 02 agent runtime on the machine: tree-sitter symbols, git-aware staleness, and an MCP server for coding agents. Public alpha live image.",
    blurb:
      "GNOME desktop with the on-machine 02 agent runtime: tree-sitter symbols, git-aware staleness, and an MCP server. Local-first, with no required model API.",
    metric: "Public alpha · v2026.10.01",
    placement: "featured-wide",
    noteId: "02-os",
    tags: ["Rust", "GNOME", "MCP", "Linux"],
    logo: "/02-logo.png",
    spotlight: "Public alpha",
    releaseNote:
      "v2026.10.01 live image. Local-first — no account and no required model API.",
    links: [
      {
        label: "GitHub",
        href: "https://github.com/csy20/02_OS",
      },
      {
        label: "Release",
        href: "https://github.com/csy20/02_OS/releases/tag/v2026.10.01",
      },
    ],
  },
  {
    slug: "bytewise",
    title: "Bytewise",
    eyebrow: "Learning app",
    description:
      "Production Flutter app on Google Play: 788+ DSA / system-design lessons with an offline-first in-memory + SQLite cache (Riverpod, Drift).",
    blurb:
      "Production Flutter app on Google Play: 788+ DSA and system-design lessons, offline-first.",
    metric: "Live on Google Play",
    placement: "featured",
    noteId: "bytewise",
    tags: ["Flutter", "Dart", "Riverpod", "Drift / SQLite", "Play Store"],
    logo: "/bytewise-logo.png",
    spotlight: "Live on Google Play",
    releaseNote:
      "Shipping proof — store listing, release signing, and a real installable app, not a demo.",
    links: [
      {
        label: "Play Store",
        href: "https://play.google.com/store/apps/details?id=com.csy20.bytewise",
      },
    ],
  },
  {
    slug: "nen",
    title: "Nen",
    eyebrow: "Published on Play Store",
    description:
      "Offline music player for the files already on your phone. Local playback only — no streaming, no ads, no account. ExoPlayer decode, lock-screen controls, and a now-playing meter from the track envelope.",
    blurb:
      "Offline music player for the files already on your phone. No streaming, no ads, no account.",
    metric: "Live on Google Play",
    placement: "featured",
    noteId: "nen",
    tags: ["Flutter", "Dart", "ExoPlayer", "Play Store"],
    logo: "/nen-logo.png",
    spotlight: "Live on Google Play",
    releaseNote:
      "Public on Play, MIT licensed. The listing is live — not early access.",
    links: [
      {
        label: "Play Store",
        href: "https://play.google.com/store/apps/details?id=dev.csy20.nen",
      },
      {
        label: "GitHub",
        href: "https://github.com/csy20/nen",
      },
    ],
  },
  {
    slug: "speech-relay-rust",
    title: "Speech Relay Rust",
    eyebrow: "Code-mixed ASR + ONNX serving",
    description:
      "Data pipeline over MUCS Hindi–English speech (16 kHz, Devanagari + Latin filter, train/val/test). Fine-tuned Whisper with LoRA on decoder attention so it handles mid-utterance language switches. Serving path: merge LoRA, export encoder/decoder to ONNX, int8 quantize, infer from a Rust ort service outside Python.",
    blurb:
      "Whisper fine-tuned with LoRA for Hindi–English code-mix, merged, exported to ONNX, quantized to int8, and served from Rust.",
    alsoLine: "Hindi–English Whisper, served from Rust.",
    metric: "LoRA · ONNX int8 · Rust",
    placement: "also",
    tags: ["Python", "Whisper", "LoRA / PEFT", "ONNX", "Rust"],
    logo: "/logos/speech-relay-rust.svg",
    links: [
      {
        label: "GitHub",
        href: "https://github.com/csy20/speech-relay-rust",
      },
    ],
  },
  {
    slug: "mediapipe-ai",
    title: "MediaPipe AI",
    eyebrow: "Distributed media pipeline",
    description:
      "Five-container system: React client → Express REST gateway → Redis job queue → Python workers (Whisper transcription + BART summarization) → PostgreSQL metadata + MinIO. Async job polling and S3-compatible uploads up to 500 MB so workers scale independently of the API.",
    blurb:
      "React client, Express gateway, Redis queue, Python workers, PostgreSQL, and MinIO. Workers take uploads up to 500 MB.",
    alsoLine: "Transcription and summaries across five containers.",
    metric: "Five containers · 500 MB uploads",
    placement: "also",
    tags: [
      "Express",
      "Python",
      "Redis",
      "PostgreSQL",
      "MinIO",
      "Docker Compose",
    ],
    logo: "/logos/mediapipe-ai.svg",
    links: [
      {
        label: "GitHub",
        href: "https://github.com/csy20/mediapipe-ai",
      },
    ],
  },
  {
    slug: "router-agent",
    title: "Router Agent",
    eyebrow: "Token-efficient LLM router",
    description:
      "AMD Developer Hackathon ACT II: classifies tasks (math, NER, summarization, code, QA) with zero-token heuristics, then escalates to a local 1.5B LLM or at most one paid API call. OpenTelemetry traces into SigNoz; shipped as a Docker service with schema validation.",
    blurb:
      "Classifies a task with zero-token heuristics, then escalates to a local 1.5B model or at most one paid call.",
    alsoLine: "Picks a model before spending a token.",
    metric: "AMD hackathon",
    placement: "also",
    tags: ["Python", "Ollama", "OpenTelemetry", "Docker", "Hackathon"],
    logo: "/logos/router-agent.svg",
    links: [
      {
        label: "GitHub",
        href: "https://github.com/csy20/router-agent",
      },
    ],
  },
  {
    slug: "warrant",
    title: "Warrant",
    eyebrow: "MCP agent",
    description:
      "TrueForge change-control agent: real MCP tools, sandboxed analysis, and human approval before irreversible production changes.",
    blurb:
      "Change-control agent with real MCP tools, sandboxed analysis, and human approval before irreversible production changes.",
    alsoLine: "Asks before a production change.",
    metric: "MCP agent",
    placement: "also",
    tags: ["MCP", "Hackathon", "Agents"],
    logo: "/logos/warrant.svg",
    links: [
      {
        label: "GitHub",
        href: "https://github.com/csy20/warrant",
      },
    ],
  },
];

export const featuredProjects: readonly Project[] = projects.filter(
  (project) => project.placement !== "also",
);

export const alsoProjects: readonly Project[] = projects.filter(
  (project) => project.placement === "also",
);

export const socialLinks: SocialLink[] = [
  {
    label: "GitHub",
    href: "https://github.com/csy20",
    icon: "github",
    detail: "Where all my code lives.",
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/csy20/",
    icon: "linkedin",
    detail: "Connect with me here.",
  },
  {
    label: "X (the__csy20)",
    href: "https://x.com/the__csy20",
    icon: "x",
    detail: "Notes and work in public.",
  },
  {
    label: "Threads (the__csy20)",
    href: "https://www.threads.com/@the__csy20",
    icon: "threads",
    detail: "Posts and updates.",
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/@the__csy20",
    icon: "youtube",
    detail: "Talks and recordings.",
  },
  {
    label: "Instagram (the__csy20)",
    href: "https://www.instagram.com/the__csy20/",
    icon: "instagram",
    detail: "Personal feed and updates.",
  },
  {
    label: "Email",
    href: `mailto:${config.email}`,
    icon: "email",
    detail: "Best way to reach me directly.",
  },
];

export const resumeUrl = config.resumeUrl;

export type CaseStudy = {
  title: string;
  id: EngineeringNoteId;
  category: string;
  overview: string;
  decision: string;
  outcome: string;
  detail: string;
};

export const caseStudies: CaseStudy[] = [
  {
    title: "Speech Relay",
    id: "speech-relay",
    category: "Realtime systems / Applied ML",
    overview:
      "Spoken translation needs more than a good model. I built an English-to-Hindi speech pipeline over WebRTC, connecting recognition, translation, and synthesis with an instrumented backend.",
    decision:
      "Let speech boundaries drive the pipeline. Silero-VAD replaces fixed-window flushing to reduce the wait between speaking and hearing a translation.",
    outcome:
      `${speechRelayMetrics.vadComparison.reductionPercent}% lower mean latency in the separate VAD comparison: ${speechRelayMetrics.vadComparison.fixedWindowMs.toLocaleString("en-US")} ms fixed-window → ${speechRelayMetrics.vadComparison.vadMs.toLocaleString("en-US")} ms VAD.`,
    detail:
      "The full-pipeline CPU profile measured 2,505 ms mean and 2,580 ms p50 across 11 utterances using faster-whisper tiny/int8, OPUS-MT, and edge-tts. These profile measurements are separate from the VAD comparison. A shared ASR stream fans out to multiple listeners; WER/CER evaluation tracks recognition quality alongside timing.",
  },
  {
    title: "02_OS",
    id: "02-os",
    category: "Local agents / Systems engineering",
    overview:
      "Coding agents need useful context on the machine. I built a GNOME desktop with the 02 agent runtime, tree-sitter symbols, and an MCP server for local coding workflows.",
    decision:
      "Keep context local and git-aware. Staleness tracking helps agents work with the current code instead of an outdated index.",
    outcome:
      "Public alpha · v2026.10.01 live image. No account or required model API.",
    detail:
      "The desktop bundles the runtime with a public live image. Symbol extraction and git-aware staleness feed an MCP interface for coding agents. This is an early, publicly downloadable alpha; the release and source are the evidence of its current status.",
  },
  {
    title: "Bytewise",
    id: "bytewise",
    category: "Shipped product / Mobile engineering",
    overview:
      "Learning should work even when the network doesn't. I shipped a Flutter app with 788+ DSA and system-design lessons, available on Google Play.",
    decision:
      "Make reading offline-first. An in-memory cache and SQLite persistence keep lessons available, with Riverpod managing app state.",
    outcome: "Live on Google Play · a signed, installable product.",
    detail:
      "Built with Flutter and Dart, using Riverpod and Drift / SQLite for an offline-first lesson library. The work includes product delivery, release signing, and the published store listing. The lesson count describes content, not users or downloads.",
  },
];

export type ProductSpotlight = {
  title: string;
  id: EngineeringNoteId;
  coverLine: string;
  overview: string;
  features: string[];
};

export const productSpotlights: ProductSpotlight[] = [
  {
    title: "Nen",
    id: "nen",
    coverLine: "Your music.\nOn your phone.",
    overview:
      "An offline music player for the files already on your phone. Published on Google Play, with no ads, no account, and no streaming dependency.",
    features: [
      "Offline local playback",
      "No ads or account",
      "Lock-screen controls",
    ],
  },
];

export function getNoteIdForProjectTitle(title: string): EngineeringNoteId | null {
  return projects.find((item) => item.title === title)?.noteId ?? null;
}

export function parseNoteHash(hash: string): EngineeringNoteId | null {
  const prefix = "#notes-";
  if (!hash.startsWith(prefix)) return null;
  const candidate = hash.slice(prefix.length);
  return (ENGINEERING_NOTE_IDS as readonly string[]).includes(candidate)
    ? (candidate as EngineeringNoteId)
    : null;
}

export type ResolvedNote =
  | { kind: "case-study"; project: Project; study: CaseStudy }
  | { kind: "spotlight"; project: Project; spotlight: ProductSpotlight };

export function resolveNote(id: EngineeringNoteId): ResolvedNote {
  const study = caseStudies.find((item) => item.id === id);
  if (study) {
    const project = projects.find((item) => item.title === study.title);
    if (!project) throw new Error(`Missing project for case study: ${study.title}`);
    return { kind: "case-study", project, study };
  }
  const spotlight = productSpotlights.find((item) => item.id === id);
  if (spotlight) {
    const project = projects.find((item) => item.title === spotlight.title);
    if (!project) throw new Error(`Missing project for spotlight: ${spotlight.title}`);
    return { kind: "spotlight", project, spotlight };
  }
  throw new Error(`Unknown engineering note: ${id}`);
}

export function getAdjacentNotes(id: EngineeringNoteId) {
  const index = ENGINEERING_NOTE_IDS.indexOf(id);
  const total = ENGINEERING_NOTE_IDS.length;
  const prevId = ENGINEERING_NOTE_IDS[(index - 1 + total) % total];
  const nextId = ENGINEERING_NOTE_IDS[(index + 1) % total];
  return {
    index,
    total,
    prevId,
    nextId,
    prevTitle: resolveNote(prevId).project.title,
    nextTitle: resolveNote(nextId).project.title,
  };
}
