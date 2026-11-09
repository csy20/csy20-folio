import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ENGINEERING_NOTE_IDS,
  getAdjacentNotes,
  resolveNote,
  resumeUrl,
  type EngineeringNoteId,
} from "@/data/siteContent";
import { SocialDock } from "@/dock/SocialDock";
import { IndiaClock } from "@/site/IndiaClock";
import { PipelineSchematic } from "@/site/PipelineSchematic";

function isEngineeringNoteId(value: string): value is EngineeringNoteId {
  return (ENGINEERING_NOTE_IDS as readonly string[]).includes(value);
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
  const title = `${resolved.project.title} — Engineering Notes · Chitresh Yadav`;
  const description =
    resolved.kind === "case-study"
      ? `${resolved.study.decision} ${resolved.study.outcome}`
      : resolved.spotlight.overview;

  return {
    title,
    description,
    alternates: { canonical: `/notes/${id}` },
    openGraph: {
      type: "article",
      url: `/notes/${id}`,
      siteName: "csy20",
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

  return (
    <>
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
                className={`work-logo h-12 w-12 shrink-0 rounded-[0.9rem] object-contain ${
                  resolved.project.slug === "02-os"
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
              <h1 className="mt-1 text-[2rem] leading-tight font-medium tracking-[-0.035em] text-[var(--ink)] sm:text-[2.5rem]">
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
        </article>
      </main>
      <SocialDock />
    </>
  );
}
