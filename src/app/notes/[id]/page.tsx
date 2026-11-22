import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { config } from "@/config";
import {
  ENGINEERING_NOTE_IDS,
  getAdjacentNotes,
  profile,
  resolveNote,
  resumeUrl,
  type EngineeringNoteId,
  type ResolvedNote,
} from "@/data/siteContent";
import { SocialDock } from "@/dock/SocialDock";
import { AgentRuntimeInspector } from "@/site/AgentRuntimeInspector";
import { BytewiseCacheStrip, NenEnvelopeMeter } from "@/site/CardVisualizers";
import { IndiaClock } from "@/site/IndiaClock";
import { PipelineSchematic } from "@/site/PipelineSchematic";
import { SiteNetwork } from "@/site/SiteNetwork";

function isEngineeringNoteId(value: string): value is EngineeringNoteId {
  return (ENGINEERING_NOTE_IDS as readonly string[]).includes(value);
}

function describeNote(resolved: ResolvedNote): string {
  return resolved.kind === "case-study"
    ? `${resolved.study.decision} ${resolved.study.outcome}`
    : resolved.spotlight.overview;
}

export function generateStaticParams() {
  return ENGINEERING_NOTE_IDS.map((id) => ({ id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  if (!isEngineeringNoteId(id)) return {};

  const resolved = resolveNote(id);
  const title = `${resolved.project.title} — Engineering Notes · ${profile.name}`;
  const description = describeNote(resolved);

  return {
    title,
    description,
    alternates: { canonical: `/notes/${id}` },
    openGraph: {
      type: "article",
      url: `/notes/${id}`,
      siteName: profile.handle,
      title,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function EngineeringNotePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!isEngineeringNoteId(id)) {
    notFound();
  }

  const resolved = resolveNote(id);
  const adjacent = getAdjacentNotes(id);
  const noteUrl = `${config.siteUrl}/notes/${id}`;
  const description = describeNote(resolved);

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: `${resolved.project.title} — ${
      resolved.kind === "case-study"
        ? resolved.study.category
        : resolved.project.eyebrow
    }`,
    name: resolved.project.title,
    description,
    url: noteUrl,
    mainEntityOfPage: noteUrl,
    image: `${noteUrl}/opengraph-image`,
    keywords: resolved.project.tags,
    author: {
      "@type": "Person",
      "@id": `${config.siteUrl}/#person`,
      name: profile.name,
      url: config.siteUrl,
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: config.siteUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Selected work",
        item: `${config.siteUrl}/#projects`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: resolved.project.title,
        item: noteUrl,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <main
        id="main-content"
        tabIndex={-1}
        className="mx-auto w-full max-w-[44rem] px-6 pt-14 pb-36 outline-none sm:pt-20"
      >
        <header className="site-header sticky top-0 z-40 flex items-center justify-between gap-3 bg-[var(--page-bg)] py-3 text-[14px] [box-shadow:0_0_0_100vmax_var(--page-bg)] [clip-path:inset(0_-100vmax)]">
          <Link
            href="/#projects"
            className="page-link font-mono text-[13px] tracking-[-0.02em] text-[var(--ink-soft)] hover:text-[var(--ink)]"
          >
            ← csy20 / work
          </Link>
          <div className="flex items-center gap-3 sm:gap-5">
            <a
              href={resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="page-link text-[12.5px] text-[var(--ink-faint)] transition-colors sm:text-[13px]"
            >
              Resume
            </a>
            <IndiaClock />
          </div>
        </header>

        <article className="pt-10 sm:pt-16">
          <div className="flex items-center gap-4">
            {resolved.project.logo ? (
              <Image
                src={resolved.project.logo}
                alt=""
                width={64}
                height={64}
                style={{ viewTransitionName: `note-logo-${id}` }}
                className={`work-logo h-12 w-12 shrink-0 rounded-[0.9rem] object-contain ${
                  resolved.project.logoWell === "white"
                    ? "bg-white"
                    : "bg-[var(--logo-well)]"
                }`}
              />
            ) : null}
            <div>
              <p className="font-mono text-[11px] tracking-[0.08em] text-[var(--ink-faint)] uppercase">
                {resolved.kind === "case-study"
                  ? resolved.study.category
                  : resolved.project.eyebrow}
              </p>
              <h1
                style={{ viewTransitionName: `note-title-${id}` }}
                className="mt-1 text-[2rem] leading-tight font-medium tracking-[-0.035em] text-[var(--ink)] sm:text-[2.5rem]"
              >
                {resolved.project.title}
              </h1>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-y border-[var(--line)] py-3">
            <ul
              aria-label="Technologies"
              className="flex flex-wrap gap-1.5 font-mono text-[11px] text-[var(--ink-soft)]"
            >
              {resolved.project.tags.map((tag) => (
                <li
                  key={tag}
                  className="rounded-md border border-[var(--line)] bg-[var(--logo-well)] px-2 py-0.5"
                >
                  {tag}
                </li>
              ))}
            </ul>
            <span className="font-mono text-[11.5px] text-[var(--accent)]">
              {resolved.project.metric}
            </span>
          </div>

          {id === "speech-relay" ? (
            <div className="mt-6">
              <PipelineSchematic />
            </div>
          ) : null}
          {id === "02-os" ? (
            <div className="mt-6">
              <AgentRuntimeInspector />
            </div>
          ) : null}
          {id === "bytewise" ? (
            <div className="mt-6">
              <BytewiseCacheStrip />
            </div>
          ) : null}
          {id === "nen" ? (
            <div className="mt-6">
              <NenEnvelopeMeter />
            </div>
          ) : null}

          {resolved.kind === "case-study" ? (
            <dl className="mt-8 space-y-6 text-[15px] leading-7">
              <div>
                <dt className="font-mono text-[11px] tracking-[0.08em] text-[var(--ink-faint)] uppercase">
                  Overview
                </dt>
                <dd className="mt-1.5 text-[var(--ink-soft)]">
                  {resolved.study.overview}
                </dd>
              </div>
              <div>
                <dt className="font-mono text-[11px] tracking-[0.08em] text-[var(--ink-faint)] uppercase">
                  Architectural decision
                </dt>
                <dd className="mt-1.5 text-[var(--ink-soft)]">
                  {resolved.study.decision}
                </dd>
              </div>
              <div className="rounded-xl border border-[var(--line)] bg-[var(--logo-well)] p-4">
                <dt className="font-mono text-[11px] tracking-[0.08em] text-[var(--accent)] uppercase">
                  Measured outcome
                </dt>
                <dd className="mt-1.5 font-medium text-[var(--ink)]">
                  {resolved.study.outcome}
                </dd>
              </div>
              <div>
                <dt className="font-mono text-[11px] tracking-[0.08em] text-[var(--ink-faint)] uppercase">
                  Implementation detail
                </dt>
                <dd className="mt-1.5 text-[var(--ink-soft)]">
                  {resolved.study.detail}
                </dd>
              </div>
            </dl>
          ) : (
            <div className="mt-8 space-y-5 text-[15px] leading-7">
              <p className="text-[1.35rem] leading-snug font-medium tracking-[-0.025em] text-[var(--ink)]">
                {resolved.spotlight.coverLine.replace("\n", " ")}
              </p>
              <p className="text-[var(--ink-soft)]">
                {resolved.spotlight.overview}
              </p>
              <div>
                <h2 className="font-mono text-[11px] tracking-[0.08em] text-[var(--ink-faint)] uppercase">
                  Product guarantees
                </h2>
                <ul className="mt-2.5 space-y-2 text-[var(--ink-soft)]">
                  {resolved.spotlight.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2.5">
                      <span
                        aria-hidden="true"
                        className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]"
                      />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <section
            aria-label="Engineering deep dive"
            className="mt-10 space-y-8 border-t border-[var(--line)] pt-8"
          >
            <div>
              <h2 className="font-mono text-[11px] tracking-[0.08em] text-[var(--ink-faint)] uppercase">
                Architecture &amp; measured specs
              </h2>
              <dl className="mt-3 grid gap-2.5 sm:grid-cols-2">
                {(resolved.kind === "case-study"
                  ? resolved.study.deepDive
                  : resolved.spotlight.deepDive
                ).specs.map((spec) => (
                  <div
                    key={spec.label}
                    className="rounded-xl border border-[var(--line)] bg-[var(--card)] px-3.5 py-2.5"
                  >
                    <dt className="font-mono text-[10.5px] tracking-[0.06em] text-[var(--ink-faint)] uppercase">
                      {spec.label}
                    </dt>
                    <dd className="mt-1 font-mono text-[12.5px] leading-5 text-[var(--ink)]">
                      {spec.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            <div>
              <h2 className="font-mono text-[11px] tracking-[0.08em] text-[var(--ink-faint)] uppercase">
                Data &amp; execution flow
              </h2>
              <ol className="mt-3 flex flex-wrap items-center gap-2 font-mono text-[11.5px] text-[var(--ink-soft)]">
                {(resolved.kind === "case-study"
                  ? resolved.study.deepDive
                  : resolved.spotlight.deepDive
                ).flow.map((step, index, arr) => (
                  <li key={step} className="inline-flex items-center gap-2">
                    <span className="rounded-md border border-[var(--line)] bg-[var(--logo-well)] px-2.5 py-1 text-[var(--ink)]">
                      {step}
                    </span>
                    {index < arr.length - 1 ? (
                      <span
                        aria-hidden="true"
                        className="text-[var(--ink-faint)]"
                      >
                        →
                      </span>
                    ) : null}
                  </li>
                ))}
              </ol>
            </div>

            <div>
              <h2 className="font-mono text-[11px] tracking-[0.08em] text-[var(--ink-faint)] uppercase">
                Trade-offs &amp; engineering decisions
              </h2>
              <ul className="mt-3 space-y-3.5">
                {(resolved.kind === "case-study"
                  ? resolved.study.deepDive
                  : resolved.spotlight.deepDive
                ).tradeoffs.map((item) => (
                  <li
                    key={item.title}
                    className="rounded-xl border border-[var(--line)] bg-[var(--card)] p-4"
                  >
                    <h3 className="text-[14.5px] font-medium tracking-[-0.015em] text-[var(--ink)]">
                      {item.title}
                    </h3>
                    <p className="mt-1.5 text-[14px] leading-6 text-[var(--ink-soft)]">
                      {item.detail}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-[var(--line)] pt-5">
            {resolved.project.releaseNote ? (
              <p className="max-w-[42ch] font-mono text-[11.5px] leading-5 text-[var(--ink-faint)]">
                {resolved.project.releaseNote}
              </p>
            ) : (
              <span />
            )}
            <div className="flex flex-wrap gap-4">
              {resolved.project.links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="page-link text-[14px] font-medium text-[var(--ink)] underline-offset-4 hover:underline"
                >
                  {link.label} ↗
                </a>
              ))}
            </div>
          </div>

          <nav
            aria-label="Engineering notes pagination"
            className="mt-8 flex items-center justify-between gap-3 border-t border-[var(--line)] pt-5 font-mono text-[12.5px]"
          >
            <Link
              href={`/notes/${adjacent.prevId}`}
              className="page-link text-[var(--ink-soft)] transition-colors hover:text-[var(--ink)]"
            >
              ← {adjacent.prevTitle}
            </Link>
            <span className="text-[11px] tabular-nums text-[var(--ink-faint)]">
              {adjacent.index + 1} / {adjacent.total}
            </span>
            <Link
              href={`/notes/${adjacent.nextId}`}
              className="page-link text-[var(--ink-soft)] transition-colors hover:text-[var(--ink)]"
            >
              {adjacent.nextTitle} →
            </Link>
          </nav>

          <footer className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-[var(--line)] pt-6 text-[13px] text-[var(--ink-faint)]">
            <SiteNetwork currentSiteId="csy20" />
            <a
              href="/llms.txt"
              className="page-link font-mono text-[11.5px] text-[var(--ink-faint)] hover:text-[var(--ink)]"
            >
              llms.txt
            </a>
          </footer>
        </article>
      </main>
      <SocialDock homeHref="/" />
    </>
  );
}
