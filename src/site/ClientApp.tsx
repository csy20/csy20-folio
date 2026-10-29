"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { useCallback, useSyncExternalStore, useState, type ReactNode } from "react";
import { CountUp } from "@/site/CountUp";
import { IndiaClock } from "@/site/IndiaClock";
import { PipelineSchematic } from "@/site/PipelineSchematic";
import {
  CaseStudyDialog,
  getNoteIdForProjectTitle,
  parseNoteHash,
  type EngineeringNoteId,
} from "./CaseStudyDialog";
import { CommandPalette, getContributionDomId } from "./CommandPalette";
import { ScrollProgress } from "./ScrollProgress";
import { SectionNav } from "./SectionNav";
import { Opening, usePrefersReducedMotion } from "@/site/Opening";
import { SocialDock } from "@/dock/SocialDock";
import { SoundToggle } from "@/dock/SoundToggle";
import {
  formatContributionDate,
  getContributionDate,
  mergedContributionRepositories,
  mergedContributionSummary,
  mergedContributions,
  describeContributionTimeline,
} from "@/data/contributions";
import {
  portraits,
  profile,
  projects,
  resumeUrl,
  socialLinks,
  speechRelayMetrics,
  type Project,
} from "@/data/siteContent";

const featuredTitles = ["Speech Relay", "02_OS", "Bytewise", "Nen"] as const;

const alsoTitles = [
  "Speech Relay Rust",
  "MediaPipe AI",
  "Router Agent",
  "Warrant",
] as const;

const alsoLines: Record<(typeof alsoTitles)[number], string> = {
  "Speech Relay Rust": "Hindi–English Whisper, served from Rust.",
  "MediaPipe AI": "Transcription and summaries across five containers.",
  "Router Agent": "Picks a model before spending a token.",
  Warrant: "Asks before a production change.",
};

const featuredContributionUrls = [
  "https://github.com/semantica-agi/semantica/pull/1922",
  "https://github.com/redhat-et/ripwire/pull/244",
  "https://github.com/internetarchive/openlibrary/pull/13611",
] as const;

const featuredContributionSet = new Set<string>(featuredContributionUrls);

const featuredContributions = featuredContributionUrls.map((url) => {
  const record = mergedContributions.find((item) => item.url === url);
  if (!record) throw new Error(`Missing contribution: ${url}`);
  return record;
});

const moreContributions = mergedContributions.filter(
  (record) => !featuredContributionSet.has(record.url),
);

const metrics: Record<string, string> = {
  "02_OS": "Public alpha · v2026.10.01",
  Bytewise: "Live on Google Play",
  Nen: "Live on Google Play",
  "Speech Relay": `${speechRelayMetrics.profile.meanMs} ms mean · ${speechRelayMetrics.profile.p50Ms} ms p50`,
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
    `Streaming ASR → MT → TTS over WebRTC, English to Hindi. Silero-VAD cut a separate comparison from ${speechRelayMetrics.vadComparison.fixedWindowMs} ms mean to ${speechRelayMetrics.vadComparison.vadMs} ms, ${speechRelayMetrics.vadComparison.reductionPercent}% lower.`,
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

const noteHashEvent = "csy20-note-hash";

function subscribeToNoteHash(onChange: () => void) {
  window.addEventListener("hashchange", onChange);
  window.addEventListener(noteHashEvent, onChange);
  return () => {
    window.removeEventListener("hashchange", onChange);
    window.removeEventListener(noteHashEvent, onChange);
  };
}

function readNoteHash(): EngineeringNoteId | null {
  return parseNoteHash(window.location.hash);
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

function SectionLabel({
  index,
  children,
  play,
}: {
  index: string;
  children: ReactNode;
  play: boolean;
}) {
  return (
    <div>
      <div className="mb-3 flex items-baseline justify-between gap-4">
        <h2 className="text-[1.35rem] font-medium tracking-[-0.03em]">{children}</h2>
        <motion.span
          key={play ? "index" : "index-wait"}
          className="section-index font-mono text-[12px] text-[var(--ink-faint)]"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "0px 0px -40px 0px" }}
          transition={{ duration: 0.4, delay: 0.15, ease }}
        >
          {index}
        </motion.span>
      </div>
      <motion.div
        key={play ? "rule" : "rule-wait"}
        className="section-rule"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, margin: "0px 0px -40px 0px" }}
        transition={{ duration: 0.6, ease }}
      />
    </div>
  );
}

function AlsoRow({ title }: { title: (typeof alsoTitles)[number] }) {
  const project = findProject(title);
  return (
    <article id={anchors[title]} className="draw-row border-t border-[var(--line)] py-3.5">
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="draw-link text-[15px] font-medium tracking-[-0.02em]">
          {project.title}
        </h3>
        <div className="flex shrink-0 gap-3">
          {project.links.map((link) => (
            <ExternalLink
              key={link.href}
              href={link.href}
              className="page-link text-[12px] text-[var(--ink-faint)]"
            >
              {link.label}
            </ExternalLink>
          ))}
        </div>
      </div>
      <p className="mt-1 max-w-[46ch] text-[13px] leading-5 text-[var(--ink-soft)]">
        {alsoLines[title]}
      </p>
    </article>
  );
}

function ContributionList({
  records,
}: {
  records: typeof mergedContributions;
}) {
  return (
    <ol>
      {records.map((record) => {
        const timeline = describeContributionTimeline(record);
        return (
          <li key={record.url} className="draw-row border-t border-[var(--line)]">
            <details id={getContributionDomId(record)} className="group/pr">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-4 py-4 marker:content-none [&::-webkit-details-marker]:hidden">
                <span className="min-w-0">
                  <span className="flex items-center gap-2 font-mono text-[12px] text-[var(--ink-faint)]">
                    <span className="rounded border border-[var(--line)] px-1.5 text-[10px] text-[var(--pr)]">
                      merged
                    </span>
                    {record.repository}#{record.number} · {formatContributionDate(getContributionDate(record))}
                  </span>
                  <span className="draw-link mt-1 inline-block max-w-full text-[15px] leading-6">
                    {record.title}
                  </span>
                </span>
                <span
                  aria-hidden="true"
                  className="mt-1 font-mono text-[14px] leading-none text-[var(--ink-faint)] transition-transform group-open/pr:rotate-45"
                >
                  +
                </span>
              </summary>
              <div className="show-all-panel">
                <div>
                  <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 pb-3 font-mono text-[12px] text-[var(--ink-soft)]">
                    <dt className="text-[var(--ink-faint)]">Opened</dt>
                    <dd>{timeline.opened}</dd>
                    {timeline.merged ? (
                      <>
                        <dt className="text-[var(--ink-faint)]">Merged</dt>
                        <dd>
                          {timeline.merged}
                          {timeline.daysToMerge !== null
                            ? timeline.daysToMerge === 0
                              ? " · same day"
                              : ` · after ${timeline.daysToMerge} ${timeline.daysToMerge === 1 ? "day" : "days"}`
                            : null}
                        </dd>
                      </>
                    ) : null}
                  </dl>
                  <ExternalLink
                    href={record.url}
                    className="page-link mb-4 inline-block text-[13px] text-[var(--ink-soft)] underline-offset-4 hover:underline"
                  >
                    View pull request on GitHub
                  </ExternalLink>
                </div>
              </div>
            </details>
          </li>
        );
      })}
    </ol>
  );
}

function ProjectRow({
  title,
  index,
  play,
  onOpenNote,
}: {
  title: string;
  index: number;
  play: boolean;
  onOpenNote: (id: EngineeringNoteId) => void;
}) {
  const project = findProject(title);
  const noteId = getNoteIdForProjectTitle(title);
  return (
    <motion.article
      id={anchors[title]}
      key={play ? title : `${title}-wait`}
      className={`work-card group flex flex-col rounded-2xl border border-[var(--line)] bg-[var(--card)] p-4 ${
        title === "Speech Relay" || title === "Nen" ? "sm:col-span-2" : ""
      }`}
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -40px 0px" }}
      transition={{ duration: 0.45, delay: index * 0.06, ease }}
      onPointerMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        event.currentTarget.style.setProperty("--mx", `${event.clientX - rect.left}px`);
        event.currentTarget.style.setProperty("--my", `${event.clientY - rect.top}px`);
      }}
    >
      {project.logo ? (
        <Image
          src={project.logo}
          alt=""
          width={64}
          height={64}
          className={`work-logo h-11 w-11 rounded-[0.85rem] object-contain ${
            title === "02_OS" ? "bg-white" : "bg-[var(--logo-well)]"
          }`}
        />
      ) : null}
      <h3 className="work-title mt-4 text-[1.05rem] font-medium tracking-[-0.02em] text-[var(--ink)]">
        {project.title}
      </h3>
      <p className="mt-1.5 line-clamp-3 text-[13px] leading-5 text-[var(--ink-soft)]">
        {blurbs[title]}
      </p>
      {title === "Speech Relay" ? <PipelineSchematic /> : null}
      <p className="mt-3 font-mono text-[11px] leading-4 text-[var(--ink-faint)]">
        {metrics[title]}
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1">
        {noteId ? (
          <button
            type="button"
            onClick={() => onOpenNote(noteId)}
            className="folio-btn cursor-pointer text-[12px] font-medium text-[var(--accent)] underline-offset-4 hover:underline"
          >
            Engineering notes
          </button>
        ) : null}
        {project.links.map((link) => (
          <ExternalLink
            key={link.href}
            href={link.href}
            className="page-link text-[12px] text-[var(--ink-soft)] underline-offset-4 hover:underline"
          >
            {link.label}
          </ExternalLink>
        ))}
      </div>
    </motion.article>
  );
}

export function ClientApp() {
  const contactLinks = socialLinks.filter((link) => link.icon !== "email");
  const reducedMotion = usePrefersReducedMotion();
  const [opened, setOpened] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const activeNote = useSyncExternalStore(
    subscribeToNoteHash,
    readNoteHash,
    () => null,
  );
  const play = reducedMotion || opened;
  const onLeave = useCallback(() => {
    document.documentElement.classList.remove("is-opening");
    setOpened(true);
  }, []);
  const openNote = useCallback((id: EngineeringNoteId) => {
    window.history.replaceState(null, "", `#notes-${id}`);
    window.dispatchEvent(new Event(noteHashEvent));
  }, []);
  const closeNote = useCallback(() => {
    if (parseNoteHash(window.location.hash)) {
      window.history.replaceState(
        null,
        "",
        window.location.pathname + window.location.search,
      );
      window.dispatchEvent(new Event(noteHashEvent));
    }
  }, []);

  return (
    <>
      <a
        href="#main-content"
        className="page-link sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:bg-[var(--ink)] focus:px-3 focus:py-2 focus:text-[var(--page-bg)]"
      >
        Skip to content
      </a>
      <ScrollProgress />
      <main
        id="main-content"
        tabIndex={-1}
        className="mx-auto w-full max-w-[48rem] px-6 pt-14 pb-36 outline-none sm:pt-20"
      >
        <motion.header
          className="reveal sticky top-0 z-40 flex items-center justify-between gap-4 bg-[var(--page-bg)] py-3 text-[14px] [box-shadow:0_0_0_100vmax_var(--page-bg)] [clip-path:inset(0_-100vmax)]"
          {...enter(play, 0)}
        >
          <a href="#hero" className="page-link tracking-[-0.02em]">
            csy20
          </a>
          <div className="flex items-center gap-5">
            <SectionNav />
            <IndiaClock />
            <ExternalLink
              href={resumeUrl}
              className="page-link text-[var(--ink-faint)]"
            >
              Resume
            </ExternalLink>
            <button
              type="button"
              onClick={() => setPaletteOpen(true)}
              aria-label="Open command palette"
              aria-keyshortcuts="Control+K Meta+K"
              className="folio-btn cursor-pointer rounded-md border border-[var(--line)] bg-[var(--card)] px-2 py-0.5 font-mono text-[11px] text-[var(--ink-faint)] transition-colors hover:border-[var(--ink-soft)] hover:text-[var(--ink)]"
            >
              ⌘K
            </button>
          </div>
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
                <p className="mt-3 text-[17px] text-[var(--ink-soft)]">{profile.role}</p>
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
            <p className="mt-6 max-w-[46ch] text-[16px] leading-7 text-[var(--ink-soft)]">
              {profile.heroDescription}
            </p>
          </motion.div>
          <motion.div className="reveal" {...enter(play, 0.26)}>
            <div className="mt-10 grid gap-x-6 gap-y-5 sm:grid-cols-3">
              <a href="#speech-relay" className="page-link border-t border-[var(--line)] pt-3">
                <strong className="block text-[15px] font-medium tracking-[-0.02em]">
                  <CountUp to={speechRelayMetrics.vadComparison.reductionPercent} decimals={1} active={play} />% less latency
                </strong>
                <span className="mt-1 block text-[13px] leading-5 text-[var(--ink-faint)]">
                  Speech Relay · VAD vs fixed windows
                </span>
              </a>
              <a href="#open-source" className="page-link border-t border-[var(--line)] pt-3">
                <strong className="block text-[15px] font-medium tracking-[-0.02em]">
                  <CountUp to={mergedContributionSummary.merged} active={play} /> merged upstream PRs
                </strong>
                <span className="mt-1 block text-[13px] leading-5 text-[var(--ink-faint)]">
                  {mergedContributionSummary.repositories} repositories
                </span>
              </a>
              <a href="#bytewise" className="page-link border-t border-[var(--line)] pt-3">
                <strong className="block text-[15px] font-medium tracking-[-0.02em]">
                  Shipped on Google Play
                </strong>
                <span className="mt-1 block text-[13px] leading-5 text-[var(--ink-faint)]">
                  Bytewise and Nen
                </span>
              </a>
            </div>
            <div className="mt-8 flex gap-6 text-[14px]">
              <a href="mailto:chitreshy20@gmail.com" className="page-link">
                Email
              </a>
              <ExternalLink href={resumeUrl} className="page-link text-[var(--ink-faint)]">
                Resume
              </ExternalLink>
            </div>
          </motion.div>
        </section>

        <section id="projects" aria-labelledby="projects-title" className="mt-24">
          <SectionLabel index="01" play={play}>
            <span id="projects-title">Selected work</span>
          </SectionLabel>
          <div className="mt-6 grid items-stretch gap-3 sm:grid-cols-2">
            {featuredTitles.map((title, index) => (
              <ProjectRow
                key={title}
                title={title}
                index={index}
                play={play}
                onOpenNote={openNote}
              />
            ))}
          </div>
          <div className="mt-10">
            <h3 className="text-[13px] tracking-[0.08em] text-[var(--ink-faint)] uppercase">
              Also
            </h3>
            <div className="mt-4">
              {alsoTitles.map((title) => (
                <AlsoRow key={title} title={title} />
              ))}
            </div>
          </div>
        </section>

        <motion.section
          id="open-source"
          aria-labelledby="open-source-title"
          className="reveal mt-24"
          {...reveal}
        >
          <SectionLabel index="02" play={play}>
            <span id="open-source-title">Open source</span>
          </SectionLabel>
          <p className="mt-4 max-w-[52ch] text-[15px] leading-7 text-[var(--ink-soft)]">
            {mergedContributionSummary.merged} merged pull requests across{" "}
            {mergedContributionSummary.repositories} repositories. Upstream
            work only. The list is a local snapshot from 14 Oct 2026.
          </p>
          <ul className="mt-6 flex flex-col gap-2">
            {mergedContributionRepositories.map((item) => (
              <li key={item.repository} className="font-mono text-[12px]">
                <ExternalLink
                  href={`https://github.com/${item.repository}`}
                  className="page-link text-[var(--ink-soft)]"
                >
                  {item.repository}
                  <span className="ml-2 text-[var(--ink)]">{item.merged}</span>
                </ExternalLink>
              </li>
            ))}
          </ul>
          <ContributionList records={featuredContributions} />
          {moreContributions.length > 0 ? (
            <details id="more-contributions-details" className="group">
              <summary className="flex cursor-pointer list-none items-baseline justify-between gap-4 border-t border-[var(--line)] py-3 text-[13px] text-[var(--ink-soft)] marker:content-none [&::-webkit-details-marker]:hidden">
                <span className="group-open:hidden">
                  Show all {mergedContributions.length}
                </span>
                <span className="hidden group-open:inline">Show less</span>
                <span className="font-mono text-[11px] text-[var(--ink-faint)] group-open:hidden">
                  {moreContributions.length} more
                </span>
              </summary>
              <div className="show-all-panel">
                <div>
                  <ContributionList records={moreContributions} />
                </div>
              </div>
            </details>
          ) : null}
          <p className="mt-6 text-[14px]">
            <ExternalLink
              href="https://github.com/csy20"
              className="page-link text-[var(--ink-soft)]"
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
          <SectionLabel index="03" play={play}>
            <span id="contact-title">Contact</span>
          </SectionLabel>
          <a
            href="mailto:chitreshy20@gmail.com"
            className="page-link mt-6 block text-[1.7rem] tracking-[-0.03em] sm:text-[2rem]"
          >
            chitreshy20@gmail.com
          </a>
          <p className="mt-3 text-[15px] text-[var(--ink-soft)]">{profile.availability}</p>
          <ul className="mt-8 flex flex-col">
            {contactLinks.map((link) => (
              <li key={link.href} className="draw-row border-t border-[var(--line)]">
                <ExternalLink
                  href={link.href}
                  className="page-link flex items-baseline justify-between gap-4 py-3 text-[15px]"
                >
                  <span className="draw-link">{link.label}</span>
                  <span className="text-[13px] text-[var(--ink-faint)]">{link.detail}</span>
                </ExternalLink>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-[14px]">
            <ExternalLink href={resumeUrl} className="page-link text-[var(--ink-soft)]">
              Resume
            </ExternalLink>
          </p>
          <footer className="mt-16 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-[var(--line)] pt-6 text-[13px] text-[var(--ink-faint)]">
            <a href="#hero" className="page-link text-[var(--ink)]">
              Chitresh Yadav <span className="text-[var(--ink-faint)]">/ csy20</span>
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
      <AfterMount>
        <CommandPalette
          open={paletteOpen}
          onOpenChange={setPaletteOpen}
          onOpenNote={openNote}
        />
        <CaseStudyDialog noteId={activeNote} onClose={closeNote} />
        {play ? <SocialDock /> : null}
      </AfterMount>
    </>
  );
}
