import { config } from "../config";

export type ProjectLinkTone = "ink" | "clay" | "mint";

export type ProjectLink = {
  label: string;
  href: string;
  tone: ProjectLinkTone;
};

export type ProjectGroup = "product" | "selected" | "other";

export type Project = {
  title: string;
  eyebrow: string;
  description: string;
  tags: string[];
  links: ProjectLink[];
  group: ProjectGroup;
  wide?: boolean;
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

export type StackItem = {
  name: string;
  icon:
    | "html"
    | "css"
    | "javascript"
    | "typescript"
    | "jsx"
    | "tsx"
    | "nextjs"
    | "react"
    | "reactnative"
    | "mongodb"
    | "express"
    | "ubuntu"
    | "flutter"
    | "go"
    | "firebase"
    | "supabase"
    | "dart"
    | "tailwindcss"
    | "python"
    | "docker"
    | "rust";
  category: "languages" | "backend" | "ml" | "platform";
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
  socialHandle: "the__csy20",
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

export const techStack: StackItem[] = [
  { name: "Python", icon: "python", category: "languages" },
  { name: "Rust", icon: "rust", category: "languages" },
  { name: "TypeScript", icon: "typescript", category: "languages" },
  { name: "SQL", icon: "javascript", category: "languages" },
  { name: "Dart", icon: "dart", category: "languages" },
  { name: "FastAPI", icon: "python", category: "backend" },
  { name: "Express.js", icon: "express", category: "backend" },
  { name: "WebRTC", icon: "javascript", category: "backend" },
  { name: "Redis", icon: "mongodb", category: "backend" },
  { name: "PostgreSQL", icon: "mongodb", category: "backend" },
  { name: "Whisper", icon: "python", category: "ml" },
  { name: "LoRA / PEFT", icon: "python", category: "ml" },
  { name: "ONNX Runtime", icon: "python", category: "ml" },
  { name: "IndicTrans2", icon: "python", category: "ml" },
  { name: "Docker", icon: "docker", category: "platform" },
  { name: "GitHub Actions", icon: "docker", category: "platform" },
  { name: "GCP", icon: "firebase", category: "platform" },
  { name: "Linux", icon: "ubuntu", category: "platform" },
];

export const projects: Project[] = [
  {
    title: "02_OS",
    eyebrow: "Agent-native desktop",
    description:
      "GNOME desktop with the 02 agent runtime on the machine: tree-sitter symbols, git-aware staleness, and an MCP server for coding agents. Public alpha live image.",
    tags: ["Rust", "GNOME", "MCP", "Linux"],
    group: "product",
    wide: true,
    logo: "/02-logo.png",
    spotlight: "Public alpha",
    releaseNote:
      "v2026.10.01 live image. Local-first — no account and no required model API.",
    links: [
      {
        label: "GitHub",
        href: "https://github.com/csy20/02_OS",
        tone: "clay",
      },
      {
        label: "Release",
        href: "https://github.com/csy20/02_OS/releases/tag/v2026.10.01",
        tone: "ink",
      },
    ],
  },
  {
    title: "Speech Relay",
    eyebrow: "Realtime speech-to-speech",
    description:
      `Streaming ASR → MT → TTS over WebRTC (EN→HI). A CPU profile measured ${speechRelayMetrics.profile.meanMs} ms mean / ${speechRelayMetrics.profile.p50Ms} ms p50 across ${speechRelayMetrics.profile.utterances} utterances. In a separate VAD comparison, mean latency fell from ${speechRelayMetrics.vadComparison.fixedWindowMs} ms to ${speechRelayMetrics.vadComparison.vadMs} ms (${speechRelayMetrics.vadComparison.reductionPercent}%). One shared ASR stream fans out to multiple listeners; a WER/CER eval harness tracks recognition quality.`,
    tags: [
      "Python",
      "faster-whisper",
      "IndicTrans2",
      "WebRTC",
      "ONNX",
      "asyncio",
    ],
    group: "selected",
    logo: "/logos/speech-relay.svg",
    spotlight: `${speechRelayMetrics.profile.meanMs} ms mean E2E`,
    releaseNote:
      "Silero-VAD replaced fixed-window flushing. Benchmark context and results are linked in the engineering notes.",
    links: [
      {
        label: "GitHub",
        href: "https://github.com/csy20/speech-relay",
        tone: "clay",
      },
    ],
  },
  {
    title: "Bytewise",
    eyebrow: "Learning app",
    description:
      "Production Flutter app on Google Play: 788+ DSA / system-design lessons with an offline-first in-memory + SQLite cache (Riverpod, Drift).",
    tags: ["Flutter", "Dart", "Riverpod", "Drift / SQLite", "Play Store"],
    group: "product",
    logo: "/bytewise-logo.png",
    spotlight: "Live on Google Play",
    releaseNote:
      "Shipping proof — store listing, release signing, and a real installable app, not a demo.",
    links: [
      {
        label: "Play Store",
        href: "https://play.google.com/store/apps/details?id=com.csy20.bytewise",
        tone: "mint",
      },
    ],
  },
  {
    title: "Speech Relay Rust",
    eyebrow: "Code-mixed ASR + ONNX serving",
    description:
      "Data pipeline over MUCS Hindi–English speech (16 kHz, Devanagari + Latin filter, train/val/test). Fine-tuned Whisper with LoRA on decoder attention so it handles mid-utterance language switches. Serving path: merge LoRA, export encoder/decoder to ONNX, int8 quantize, infer from a Rust ort service outside Python.",
    tags: ["Python", "Whisper", "LoRA / PEFT", "ONNX", "Rust"],
    group: "selected",
    logo: "/logos/speech-relay-rust.svg",
    links: [
      {
        label: "GitHub",
        href: "https://github.com/csy20/speech-relay-rust",
        tone: "clay",
      },
    ],
  },
  {
    title: "MediaPipe AI",
    eyebrow: "Distributed media pipeline",
    description:
      "Five-container system: React client → Express REST gateway → Redis job queue → Python workers (Whisper transcription + BART summarization) → PostgreSQL metadata + MinIO. Async job polling and S3-compatible uploads up to 500 MB so workers scale independently of the API.",
    tags: [
      "Express",
      "Python",
      "Redis",
      "PostgreSQL",
      "MinIO",
      "Docker Compose",
    ],
    group: "selected",
    logo: "/logos/mediapipe-ai.svg",
    links: [
      {
        label: "GitHub",
        href: "https://github.com/csy20/mediapipe-ai",
        tone: "clay",
      },
    ],
  },
  {
    title: "Router Agent",
    eyebrow: "Token-efficient LLM router",
    description:
      "AMD Developer Hackathon ACT II: classifies tasks (math, NER, summarization, code, QA) with zero-token heuristics, then escalates to a local 1.5B LLM or at most one paid API call. OpenTelemetry traces into SigNoz; shipped as a Docker service with schema validation.",
    tags: ["Python", "Ollama", "OpenTelemetry", "Docker", "Hackathon"],
    group: "other",
    logo: "/logos/router-agent.svg",
    links: [
      {
        label: "GitHub",
        href: "https://github.com/csy20/router-agent",
        tone: "clay",
      },
    ],
  },
  {
    title: "Nen",
    eyebrow: "Published on Play Store",
    description:
      "Offline music player for the files already on your phone. Local playback only — no streaming, no ads, no account. ExoPlayer decode, lock-screen controls, and a now-playing meter from the track envelope.",
    tags: ["Flutter", "Dart", "ExoPlayer", "Play Store"],
    group: "product",
    logo: "/nen-logo.png",
    spotlight: "Live on Google Play",
    releaseNote:
      "Public on Play, MIT licensed. The listing is live — not early access.",
    links: [
      {
        label: "Play Store",
        href: "https://play.google.com/store/apps/details?id=dev.csy20.nen",
        tone: "mint",
      },
      {
        label: "GitHub",
        href: "https://github.com/csy20/nen",
        tone: "clay",
      },
    ],
  },
  {
    title: "Warrant",
    eyebrow: "MCP agent",
    description:
      "TrueForge change-control agent: real MCP tools, sandboxed analysis, and human approval before irreversible production changes.",
    tags: ["MCP", "Hackathon", "Agents"],
    group: "other",
    logo: "/logos/warrant.svg",
    links: [
      {
        label: "GitHub",
        href: "https://github.com/csy20/warrant",
        tone: "clay",
      },
    ],
  },
];

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

export const colophon = "Instrument Serif · Space Grotesk · 2026";

export type CaseStudy = {
  title: string;
  id: string;
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
  id: string;
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

export const about = {
  introduction:
    "I'm Chitresh, an engineer focused on backend systems and applied machine learning. I like the whole path: understanding a problem, building the system, measuring it, and getting it into someone's hands.",
  approach:
    "My work moves between Python, Rust, and TypeScript — speech pipelines, local agent tooling, and queue-based services. I also ship Flutter products and contribute fixes upstream when the work takes me there.",
};
