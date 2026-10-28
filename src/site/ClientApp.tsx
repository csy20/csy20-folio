"use client";

import { motion } from "motion/react";
import { useCallback, useSyncExternalStore, useState, type ReactNode } from "react";
import { Opening, usePrefersReducedMotion } from "@/site/Opening";
import { SocialDock } from "@/dock/SocialDock";
import { SoundToggle } from "@/dock/SoundToggle";
import {
  formatContributionDate,
  getContributionDate,
  mergedContributionRepositories,
  mergedContributionSummary,
  mergedContributions,
} from "@/data/contributions";
import {
  portraits,
  profile,
  projects,
  resumeUrl,
  socialLinks,
  type Project,
} from "@/data/siteContent";

const featuredTitles = [
  "02_OS",
  "Bytewise",
  "Nen",
  "Speech Relay",
  "Speech Relay Rust",
  "MediaPipe AI",
] as const;

const alsoTitles = ["Router Agent", "Warrant"] as const;

const metrics: Record<string, string> = {
  "02_OS": "Public alpha · v2026.10.01",
  Bytewise: "Live on Google Play",
  Nen: "Live on Google Play",
  "Speech Relay": "2505 ms mean · 2580 ms p50",
  "Speech Relay Rust": "LoRA · ONNX int8 · Rust",
  "MediaPipe AI": "Five containers · 500 MB uploads",
  "Router Agent": "AMD hackathon",
  Warrant: "MCP agent",
};

const blurbs: Record<string, string> = {
  "02_OS":
    "GNOME desktop with the on-machine 02 agent runtime: tree-sitter symbols, git-aware staleness, and an MCP server. Local-first, with no required model API.",
  Bytewise:
    "Production Flutter app on Google Play: 788+ DSA and system-design lessons, offline-first.",
  Nen: "Offline music player for the files already on your phone. No streaming, no ads, no account.",
  "Speech Relay":
    "Streaming ASR → MT → TTS over WebRTC, English to Hindi. Silero-VAD cut a separate comparison from 4708 ms mean to 3597 ms, 23.6% lower.",
  "Speech Relay Rust":
    "Whisper fine-tuned with LoRA for Hindi–English code-mix, merged, exported to ONNX, quantized to int8, and served from Rust.",
  "MediaPipe AI":
    "React client, Express gateway, Redis queue, Python workers, PostgreSQL, and MinIO. Workers take uploads up to 500 MB.",
  "Router Agent":
    "Classifies a task with zero-token heuristics, then escalates to a local 1.5B model or at most one paid call.",
  Warrant:
    "Change-control agent with real MCP tools, sandboxed analysis, and human approval before irreversible production changes.",
};

const anchors: Record<string, string> = {
  "02_OS": "02-os",
  Bytewise: "bytewise",
  Nen: "nen",
  "Speech Relay": "speech-relay",
  "Speech Relay Rust": "speech-relay-rust",
  "MediaPipe AI": "mediapipe-ai",
  "Router Agent": "router-agent",
  Warrant: "warrant",
};

const ease = [0.22, 1, 0.36, 1] as const;

const reveal = {
  initial: { opacity: 0, y: 12 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "0px 0px -40px 0px" },
  transition: { duration: 0.45, ease },
};

function enter(play: boolean, delay: number) {
  return {
    initial: { opacity: 0, y: 12 },
    animate: play ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 },
    transition: { duration: 0.5, delay: play ? delay : 0, ease },
  };
}

function subscribeToClient() {
  return () => {};
}

function AfterMount({ children }: { children: ReactNode }) {
  const mounted = useSyncExternalStore(
    subscribeToClient,
    () => true,
    () => false,
  );
  if (!mounted) return null;
  return children;
}

function findProject(title: string): Project {
  const project = projects.find((item) => item.title === title);
  if (!project) throw new Error(`Missing project: ${title}`);
  return project;
}

function ExternalLink({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  const external = /^https?:/.test(href);
  return (
    <a
      href={href}
      className={className ?? "page-link"}
      {...(external
        ? { target: "_blank", rel: "noopener noreferrer" }
        : {})}
    >
      {children}
    </a>
  );
}

function SectionLabel({ index, children }: { index: string; children: ReactNode }) {
  return (
    <div className="mb-2 flex items-baseline justify-between gap-4">
      <h2 className="text-[1.35rem] font-medium tracking-[-0.03em]">{children}</h2>
      <span className="font-mono text-[12px] text-[#8d8b84]">{index}</span>
    </div>
  );
}

function ProjectRow({ title }: { title: string }) {
  const project = findProject(title);
  return (
    <article
      id={anchors[title]}
      className="group flex flex-col rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4"
    >
      {project.logo ? (
        <img
          src={project.logo}
          alt=""
          width={64}
          height={64}
          className="h-11 w-11 rounded-[0.85rem] bg-[#111214] object-contain"
        />
      ) : null}
      <h3 className="mt-4 text-[1.05rem] font-medium tracking-[-0.02em] text-[#eceae4] group-hover:text-white">
        {project.title}
      </h3>
      <p className="mt-1.5 line-clamp-3 text-[13px] leading-5 text-[#b7b5ae]">
        {blurbs[title]}
      </p>
      <p className="mt-3 font-mono text-[11px] leading-4 text-[#8d8b84]">
        {metrics[title]}
      </p>
      <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1">
        {project.links.map((link) => (
          <ExternalLink
            key={link.href}
            href={link.href}
            className="page-link text-[12px] text-[#b7b5ae] underline-offset-4 hover:underline"
          >
            {link.label}
          </ExternalLink>
        ))}
      </div>
    </article>
  );
}

export function ClientApp() {
  const contactLinks = socialLinks.filter((link) => link.icon !== "email");
  const reducedMotion = usePrefersReducedMotion();
  const [opened, setOpened] = useState(false);
  const play = reducedMotion || opened;
  const onLeave = useCallback(() => {
    document.documentElement.classList.remove("is-opening");
    setOpened(true);
  }, []);

  return (
    <>
      <a
        href="#main-content"
        className="page-link sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:bg-[#eceae4] focus:px-3 focus:py-2 focus:text-[#191a1b]"
      >
        Skip to content
      </a>
      <main
        id="main-content"
        tabIndex={-1}
        className="mx-auto w-full max-w-[40rem] px-6 pt-14 pb-36 outline-none sm:pt-20"
      >
        <motion.header
          className="reveal flex items-baseline justify-between gap-4 text-[14px]"
          {...enter(play, 0)}
        >
          <span className="flex items-baseline gap-3">
            <a href="#hero" className="page-link tracking-[-0.02em]">
              csy20
            </a>
            <span className="font-mono text-[12px] text-[#8d8b84]">
              IST · UTC+5:30
            </span>
          </span>
          <ExternalLink
            href={resumeUrl}
            className="page-link text-[#8d8b84]"
          >
            Resume
          </ExternalLink>
        </motion.header>

        <section id="hero" aria-labelledby="intro-heading" className="pt-16 sm:pt-24">
          <motion.div className="reveal" {...enter(play, 0.08)}>
            <div className="flex items-center justify-between gap-5">
              <div className="min-w-0">
                <h1
                  id="intro-heading"
                  className="text-[2.7rem] leading-[0.96] font-medium tracking-[-0.045em] sm:text-[3.5rem]"
                >
                  {profile.name}
                </h1>
                <p className="mt-3 text-[17px] text-[#b7b5ae]">{profile.role}</p>
              </div>
              <picture className="shrink-0">
                <source srcSet="/portrait-twitter.webp" type="image/webp" />
                <img
                  src={portraits.twitter.src}
                  alt={portraits.twitter.alt}
                  width={736}
                  height={736}
                  fetchPriority="high"
                  decoding="async"
                  className="h-[5.5rem] w-[5.5rem] rounded-[1.15rem] object-cover sm:h-28 sm:w-28"
                />
              </picture>
            </div>
          </motion.div>
          <motion.div className="reveal" {...enter(play, 0.16)}>
            <p className="mt-8 max-w-[16ch] text-[1.7rem] leading-[1.15] font-medium tracking-[-0.035em] sm:text-[2rem]">
              Building useful software, from model to product.
            </p>
            <p className="mt-6 max-w-[46ch] text-[16px] leading-7 text-[#b7b5ae]">
              {profile.heroDescription}
            </p>
          </motion.div>
          <motion.div className="reveal" {...enter(play, 0.26)}>
            <div className="mt-10 grid gap-x-6 gap-y-5 sm:grid-cols-3">
              <a href="#speech-relay" className="page-link border-t border-white/[0.08] pt-3">
                <strong className="block text-[15px] font-medium tracking-[-0.02em]">
                  23.6% less latency
                </strong>
                <span className="mt-1 block text-[13px] leading-5 text-[#8d8b84]">
                  Speech Relay · VAD vs fixed windows
                </span>
              </a>
              <a href="#open-source" className="page-link border-t border-white/[0.08] pt-3">
                <strong className="block text-[15px] font-medium tracking-[-0.02em]">
                  {mergedContributionSummary.merged} merged upstream PRs
                </strong>
                <span className="mt-1 block text-[13px] leading-5 text-[#8d8b84]">
                  {mergedContributionSummary.repositories} repositories
                </span>
              </a>
              <a href="#bytewise" className="page-link border-t border-white/[0.08] pt-3">
                <strong className="block text-[15px] font-medium tracking-[-0.02em]">
                  Shipped on Google Play
                </strong>
                <span className="mt-1 block text-[13px] leading-5 text-[#8d8b84]">
                  Bytewise and Nen
                </span>
              </a>
            </div>
            <div className="mt-8 flex gap-6 text-[14px]">
              <a href="mailto:chitreshy20@gmail.com" className="page-link">
                Email
              </a>
              <ExternalLink href={resumeUrl} className="page-link text-[#8d8b84]">
                Resume
              </ExternalLink>
            </div>
          </motion.div>
        </section>

        <motion.section
          id="projects"
          aria-labelledby="projects-title"
          className="reveal mt-24"
          {...reveal}
        >
          <SectionLabel index="01">
            <span id="projects-title">Selected work</span>
          </SectionLabel>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {featuredTitles.map((title) => (
              <ProjectRow key={title} title={title} />
            ))}
          </div>
          <div className="mt-10">
            <h3 className="text-[13px] tracking-[0.08em] text-[#8d8b84] uppercase">
              Also
            </h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {alsoTitles.map((title) => (
                <ProjectRow key={title} title={title} />
              ))}
            </div>
          </div>
        </motion.section>

        <motion.section
          id="open-source"
          aria-labelledby="open-source-title"
          className="reveal mt-24"
          {...reveal}
        >
          <SectionLabel index="02">
            <span id="open-source-title">Open source</span>
          </SectionLabel>
          <p className="mt-4 max-w-[52ch] text-[15px] leading-7 text-[#b7b5ae]">
            {mergedContributionSummary.merged} merged pull requests across{" "}
            {mergedContributionSummary.repositories} repositories. Upstream
            work only. The list is a local snapshot from 14 Oct 2026.
          </p>
          <ul className="mt-6 flex flex-col gap-2">
            {mergedContributionRepositories.map((item) => (
              <li key={item.repository} className="font-mono text-[12px]">
                <ExternalLink
                  href={`https://github.com/${item.repository}`}
                  className="page-link text-[#b7b5ae]"
                >
                  {item.repository}
                  <span className="ml-2 text-[#eceae4]">{item.merged}</span>
                </ExternalLink>
              </li>
            ))}
          </ul>
          <ol className="mt-8">
            {mergedContributions.map((record) => (
              <li key={record.url} className="border-t border-white/[0.08]">
                <ExternalLink href={record.url} className="page-link group block py-4">
                  <span className="font-mono text-[12px] text-[#8d8b84]">
                    {record.repository} ·{" "}
                    {formatContributionDate(getContributionDate(record))}
                  </span>
                  <span className="mt-1 block text-[15px] leading-6 group-hover:text-white">
                    {record.title}
                  </span>
                </ExternalLink>
              </li>
            ))}
          </ol>
          <p className="mt-6 text-[14px]">
            <ExternalLink
              href="https://github.com/csy20"
              className="page-link text-[#b7b5ae]"
            >
              github.com/csy20
            </ExternalLink>
          </p>
        </motion.section>

        <motion.section
          id="contact"
          aria-labelledby="contact-title"
          className="reveal mt-24"
          {...reveal}
        >
          <SectionLabel index="03">
            <span id="contact-title">Contact</span>
          </SectionLabel>
          <a
            href="mailto:chitreshy20@gmail.com"
            className="page-link mt-6 block text-[1.7rem] tracking-[-0.03em] sm:text-[2rem]"
          >
            chitreshy20@gmail.com
          </a>
          <p className="mt-3 text-[15px] text-[#b7b5ae]">{profile.availability}</p>
          <ul className="mt-8 flex flex-col">
            {contactLinks.map((link) => (
              <li key={link.href} className="border-t border-white/[0.08]">
                <ExternalLink
                  href={link.href}
                  className="page-link flex items-baseline justify-between gap-4 py-3 text-[15px]"
                >
                  <span>{link.label}</span>
                  <span className="text-[13px] text-[#8d8b84]">{link.detail}</span>
                </ExternalLink>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-[14px]">
            <ExternalLink href={resumeUrl} className="page-link text-[#b7b5ae]">
              Resume
            </ExternalLink>
          </p>
          <footer className="mt-16 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-white/[0.08] pt-6 text-[13px] text-[#8d8b84]">
            <a href="#hero" className="page-link text-[#eceae4]">
              Chitresh Yadav <span className="text-[#8d8b84]">/ csy20</span>
            </a>
            <span>Built with care. Kept in the open.</span>
            <AfterMount>
              <SoundToggle />
            </AfterMount>
            <span className="sm:ml-auto">© 2026</span>
          </footer>
        </motion.section>
      </main>
      <Opening onLeave={onLeave} />
      <AfterMount>{play ? <SocialDock /> : null}</AfterMount>
    </>
  );
}
