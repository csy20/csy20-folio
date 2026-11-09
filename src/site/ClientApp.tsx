import Image from "next/image";
import type { ReactNode } from "react";
import { config } from "@/config";
import {
  contributionSnapshotDate,
  contributionSnapshotYear,
  mergedContributionSummary,
} from "@/data/contributions";
import {
  alsoProjects,
  featuredProjects,
  portraits,
  profile,
  resumeUrl,
  socialLinks,
  speechRelayMetrics,
  type Project,
} from "@/data/siteContent";
import { ActivityCalendar } from "./ActivityCalendar";
import { ContributionExplorer } from "./ContributionExplorer";
import { CountUp } from "./CountUp";
import { IndiaClock } from "./IndiaClock";
import {
  CopyEmailButton,
  FooterClientControls,
  InteractiveOverlays,
  OpenNoteButton,
  ProjectCardShell,
} from "./InteractiveShell";
import { PipelineSchematic } from "./PipelineSchematic";
import { ScrollProgress } from "./ScrollProgress";
import { SectionNav } from "./SectionNav";

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
}: {
  index: string;
  children: ReactNode;
}) {
  return (
    <div>
      <div className="mb-3 flex items-baseline justify-between gap-4">
        <h2 className="text-[1.35rem] font-medium tracking-[-0.03em]">
          {children}
        </h2>
        <span className="section-index font-mono text-[12px] text-[var(--ink-faint)]">
          {index}
        </span>
      </div>
      <div className="section-rule" />
    </div>
  );
}

function AlsoRow({ project }: { project: Project }) {
  return (
    <article
      id={project.slug}
      className="draw-row border-t border-[var(--line)] py-3.5"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          {project.logo ? (
            <Image
              src={project.logo}
              alt=""
              width={48}
              height={48}
              className="work-logo h-6 w-6 shrink-0 rounded-[0.45rem] bg-[var(--logo-well)] object-contain"
            />
          ) : null}
          <h3 className="draw-link truncate text-[15px] font-medium tracking-[-0.02em]">
            {project.title}
          </h3>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <ul
            aria-label={`${project.title} technologies`}
            className="hidden items-center gap-1.5 font-mono text-[11px] text-[var(--ink-faint)] sm:flex"
          >
            {project.tags.slice(0, 3).map((tag) => (
              <li
                key={tag}
                className="rounded border border-[var(--line)] bg-[var(--card)] px-1.5 py-0.5"
              >
                {tag}
              </li>
            ))}
          </ul>
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
      <p
        className={`mt-1.5 max-w-[46ch] text-[13px] leading-5 text-[var(--ink-soft)] ${
          project.logo ? "sm:pl-[2.125rem]" : ""
        }`}
      >
        {project.alsoLine}
      </p>
    </article>
  );
}

function ProjectRow({ project }: { project: Project }) {
  const isWide = project.placement === "featured-wide";

  return (
    <ProjectCardShell
      id={project.slug}
      className={`work-card reveal-on-scroll group flex flex-col rounded-2xl border border-[var(--line)] bg-[var(--card)] p-4 ${
        isWide ? "sm:col-span-2" : ""
      }`}
    >
      {isWide ? (
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3.5">
            {project.logo ? (
              <Image
                src={project.logo}
                alt=""
                width={64}
                height={64}
                className={`work-logo h-11 w-11 shrink-0 rounded-[0.85rem] object-contain ${
                  project.slug === "02-os" ? "bg-white" : "bg-[var(--logo-well)]"
                }`}
              />
            ) : null}
            <div className="min-w-0">
              <h3 className="work-title text-[1.05rem] font-medium tracking-[-0.02em] text-[var(--ink)]">
                {project.title}
              </h3>
              <p className="mt-0.5 truncate font-mono text-[11px] text-[var(--ink-faint)]">
                {project.eyebrow}
              </p>
            </div>
          </div>
          {project.slug === "02-os" ? (
            <ul
              aria-label="02_OS technologies"
              className="hidden shrink-0 items-center gap-1.5 font-mono text-[11px] text-[var(--ink-soft)] sm:flex"
            >
              {project.tags.map((tag) => (
                <li
                  key={tag}
                  className="rounded-md border border-[var(--line)] bg-[var(--logo-well)] px-2 py-0.5"
                >
                  {tag}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : (
        <>
          {project.logo ? (
            <Image
              src={project.logo}
              alt=""
              width={64}
              height={64}
              className="work-logo h-11 w-11 rounded-[0.85rem] bg-[var(--logo-well)] object-contain"
            />
          ) : null}
          <h3 className="work-title mt-4 text-[1.05rem] font-medium tracking-[-0.02em] text-[var(--ink)]">
            {project.title}
          </h3>
        </>
      )}

      <p
        className={`text-[13px] leading-5 text-[var(--ink-soft)] ${
          isWide ? "mt-3 max-w-[64ch]" : "mt-1.5 line-clamp-3"
        }`}
      >
        {project.blurb}
      </p>

      {project.slug === "speech-relay" ? <PipelineSchematic /> : null}

      <div
        className={`mt-auto pt-3 ${
          isWide
            ? "flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
            : ""
        }`}
      >
        <p
          className={`font-mono text-[11px] leading-4 text-[var(--ink-faint)] ${
            isWide ? "sm:order-2" : ""
          }`}
        >
          {project.metric}
        </p>
        <div
          className={`flex flex-wrap items-center gap-x-3 gap-y-1 ${
            isWide ? "sm:order-1" : "mt-2.5"
          }`}
        >
          {project.noteId ? <OpenNoteButton noteId={project.noteId} /> : null}
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
      </div>
    </ProjectCardShell>
  );
}

export function ClientApp() {
  const contactLinks = socialLinks.filter((link) => link.icon !== "email");

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
        <header className="site-header sticky top-0 z-40 flex items-center justify-between gap-2 bg-[var(--page-bg)] py-3 text-[14px] [box-shadow:0_0_0_100vmax_var(--page-bg)] [clip-path:inset(0_-100vmax)] sm:gap-3">
          <a href="#hero" className="page-link shrink-0 tracking-[-0.02em]">
            csy20
          </a>
          <div className="flex items-center gap-2 sm:gap-5">
            <SectionNav />
            <ExternalLink
              href={resumeUrl}
              className="page-link border-b border-transparent pb-0.5 text-[12.5px] text-[var(--ink-faint)] transition-colors sm:text-[13px]"
            >
              Resume
            </ExternalLink>
            <IndiaClock />
          </div>
        </header>

        <section id="hero" aria-labelledby="intro-heading" className="pt-10 sm:pt-24">
          <div>
            <div className="flex items-center justify-between gap-5">
              <div className="min-w-0">
                <h1
                  id="intro-heading"
                  className="text-[2.6rem] leading-[0.96] font-medium tracking-[-0.045em] sm:text-[3.5rem]"
                >
                  {profile.name}
                </h1>
                <p className="mt-3 text-[17px] text-[var(--ink-soft)]">
                  {profile.role}
                </p>
              </div>
              <picture className="shrink-0">
                <source
                  srcSet="/portrait-twitter-256.webp 1x, /portrait-twitter.webp 2x"
                  type="image/webp"
                />
                <img
                  src={portraits.twitter.src}
                  alt={portraits.twitter.alt}
                  width={256}
                  height={256}
                  fetchPriority="high"
                  decoding="async"
                  className="h-[5.5rem] w-[5.5rem] rounded-[1.15rem] object-cover sm:h-28 sm:w-28"
                />
              </picture>
            </div>
          </div>
          <div>
            <p className="mt-7 max-w-[16ch] text-[1.65rem] leading-[1.15] font-medium tracking-[-0.035em] sm:mt-8 sm:text-[2rem]">
              Building useful software, from model to product.
            </p>
            <p className="mt-5 max-w-[46ch] text-[16px] leading-7 text-[var(--ink-soft)] sm:mt-6">
              {profile.heroDescription}
            </p>
          </div>
          <div>
            <div className="mt-7 flex items-center gap-5 text-[14px]">
              <a
                href={`mailto:${config.email}`}
                className="page-link rounded-lg border border-[var(--line)] bg-[var(--card)] px-3.5 py-1.5 font-medium text-[var(--ink)] transition-colors hover:border-[var(--ink-soft)]"
              >
                Email
              </a>
              <ExternalLink
                href={resumeUrl}
                className="page-link text-[var(--ink-soft)] underline-offset-4 hover:underline"
              >
                Resume ↗
              </ExternalLink>
            </div>
            <div className="mt-8 grid grid-cols-3 gap-x-4 gap-y-5 sm:mt-10 sm:gap-x-6">
              <a
                href="#speech-relay"
                className="page-link border-t border-[var(--line)] pt-3"
              >
                <strong className="block font-mono text-[1.35rem] leading-none font-medium tracking-[-0.04em] tabular-nums text-[var(--ink)] sm:text-[1.8rem]">
                  <CountUp
                    to={speechRelayMetrics.vadComparison.reductionPercent}
                    decimals={1}
                  />
                  %
                </strong>
                <span className="mt-1.5 block text-[12px] leading-4 font-medium text-[var(--ink-soft)] sm:text-[13px]">
                  less latency
                </span>
                <span className="mt-1 hidden text-[12px] leading-5 text-[var(--ink-faint)] sm:block">
                  Speech Relay · VAD vs fixed windows
                </span>
              </a>
              <a
                href="#open-source"
                className="page-link border-t border-[var(--line)] pt-3"
              >
                <strong className="block font-mono text-[1.35rem] leading-none font-medium tracking-[-0.04em] tabular-nums text-[var(--ink)] sm:text-[1.8rem]">
                  <CountUp to={mergedContributionSummary.merged} />
                </strong>
                <span className="mt-1.5 block text-[12px] leading-4 font-medium text-[var(--ink-soft)] sm:text-[13px]">
                  <span className="sm:hidden">merged PRs</span>
                  <span className="hidden sm:inline">merged upstream PRs</span>
                </span>
                <span className="mt-1 hidden text-[12px] leading-5 text-[var(--ink-faint)] sm:block">
                  {mergedContributionSummary.repositories} repositories
                </span>
              </a>
              <a
                href="#bytewise"
                className="page-link border-t border-[var(--line)] pt-3"
              >
                <strong className="block font-mono text-[1.35rem] leading-none font-medium tracking-[-0.04em] tabular-nums text-[var(--ink)] sm:text-[1.8rem]">
                  <CountUp to={2} />
                </strong>
                <span className="mt-1.5 block text-[12px] leading-4 font-medium text-[var(--ink-soft)] sm:text-[13px]">
                  Google Play apps
                </span>
                <span className="mt-1 hidden text-[12px] leading-5 text-[var(--ink-faint)] sm:block">
                  Bytewise and Nen
                </span>
              </a>
            </div>
          </div>
        </section>

        <section
          id="projects"
          aria-labelledby="projects-title"
          className="mt-24"
        >
          <SectionLabel index="01">
            <span id="projects-title">Selected work</span>
          </SectionLabel>
          <div className="mt-6 grid items-stretch gap-3 sm:grid-cols-2">
            {featuredProjects.map((project) => (
              <ProjectRow key={project.slug} project={project} />
            ))}
          </div>
          <div className="mt-10">
            <h3 className="text-[13px] tracking-[0.08em] text-[var(--ink-faint)] uppercase">
              Also
            </h3>
            <div className="mt-4">
              {alsoProjects.map((project) => (
                <AlsoRow key={project.slug} project={project} />
              ))}
            </div>
          </div>
        </section>

        <section
          id="open-source"
          aria-labelledby="open-source-title"
          className="reveal-on-scroll section-deferred mt-24"
        >
          <SectionLabel index="02">
            <span id="open-source-title">Open source</span>
          </SectionLabel>
          <p className="mt-4 max-w-[52ch] text-[15px] leading-7 text-[var(--ink-soft)]">
            {mergedContributionSummary.merged} merged pull requests across{" "}
            {mergedContributionSummary.repositories} repositories. Upstream work
            only. The list is a local snapshot from {contributionSnapshotDate}.
          </p>
          <ActivityCalendar />
          <ContributionExplorer />
          <p className="mt-6 text-[14px]">
            <ExternalLink
              href="https://github.com/csy20"
              className="page-link text-[var(--ink-soft)]"
            >
              github.com/csy20
            </ExternalLink>
          </p>
        </section>

        <section
          id="contact"
          aria-labelledby="contact-title"
          className="reveal-on-scroll section-deferred mt-24"
        >
          <SectionLabel index="03">
            <span id="contact-title">Contact</span>
          </SectionLabel>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <a
              href={`mailto:${config.email}`}
              className="page-link text-[1.55rem] tracking-[-0.03em] sm:text-[2rem]"
            >
              {config.email}
            </a>
            <CopyEmailButton email={config.email} />
          </div>
          <p className="mt-3 text-[15px] text-[var(--ink-soft)]">
            {profile.availability}
          </p>
          <ul className="mt-8 flex flex-col">
            {contactLinks.map((link) => (
              <li
                key={link.href}
                className="draw-row border-t border-[var(--line)]"
              >
                <ExternalLink
                  href={link.href}
                  className="page-link flex items-baseline justify-between gap-4 py-3 text-[15px]"
                >
                  <span className="draw-link">{link.label}</span>
                  <span className="text-[13px] text-[var(--ink-faint)]">
                    {link.detail}
                  </span>
                </ExternalLink>
              </li>
            ))}
          </ul>
          <footer className="mt-16 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-[var(--line)] pt-6 text-[13px] text-[var(--ink-faint)]">
            <a href="#hero" className="page-link text-[var(--ink)]">
              Chitresh Yadav{" "}
              <span className="text-[var(--ink-faint)]">/ csy20</span>
            </a>
            <span>Built with care. Kept in the open.</span>
            <FooterClientControls />
            <span className="sm:ml-auto">© {contributionSnapshotYear}</span>
          </footer>
        </section>
      </main>
      <InteractiveOverlays />
    </>
  );
}
