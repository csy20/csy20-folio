import type { Metadata } from "next";
import Link from "next/link";
import { profile, resumeUrl } from "@/data/siteContent";
import { SocialDock } from "@/dock/SocialDock";
import { IndiaClock } from "@/site/IndiaClock";

export const metadata: Metadata = {
  title: `Not found · ${profile.handle}`,
  description: "No page exists at this path.",
};

const fallbackRoutes = [
  { href: "/", label: "Home", detail: "Overview and recent work" },
  {
    href: "/#projects",
    label: "Selected work",
    detail: "Speech Relay, 02_OS, Bytewise, Nen",
  },
  {
    href: "/#open-source",
    label: "Open source",
    detail: "Activity calendar and merged upstream PRs",
  },
  {
    href: "/#contact",
    label: "Contact",
    detail: "Email and social profiles",
  },
] as const;

export default function NotFound() {
  return (
    <>
      <main
        id="main-content"
        tabIndex={-1}
        className="mx-auto w-full max-w-[44rem] px-6 pt-14 pb-36 outline-none sm:pt-20"
      >
        <header className="site-header sticky top-0 z-40 flex items-center justify-between gap-3 bg-[var(--page-bg)] py-3 text-[14px] [box-shadow:0_0_0_100vmax_var(--page-bg)] [clip-path:inset(0_-100vmax)]">
          <Link
            href="/"
            className="page-link font-mono text-[13px] tracking-[-0.02em] text-[var(--ink-soft)] hover:text-[var(--ink)]"
          >
            ← {profile.handle}
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

        <section aria-labelledby="not-found-heading" className="pt-16 sm:pt-24">
          <p className="font-mono text-[11px] tracking-[0.08em] text-[var(--ink-faint)] uppercase">
            404 · route not found
          </p>
          <h1
            id="not-found-heading"
            className="mt-2 text-[2.4rem] leading-[1.02] font-medium tracking-[-0.045em] text-[var(--ink)] sm:text-[3rem]"
          >
            Nothing at this path.
          </h1>
          <p className="mt-4 max-w-[44ch] text-[15px] leading-7 text-[var(--ink-soft)]">
            The page you requested doesn&apos;t exist or may have moved.
            Everything on this site lives on the index and its engineering
            notes.
          </p>

          <ul className="mt-10 flex flex-col">
            {fallbackRoutes.map((route) => (
              <li
                key={route.href}
                className="draw-row border-t border-[var(--line)]"
              >
                <Link
                  href={route.href}
                  className="page-link flex items-baseline justify-between gap-4 py-3 text-[15px]"
                >
                  <span className="draw-link">{route.label}</span>
                  <span className="text-[13px] text-[var(--ink-faint)]">
                    {route.detail}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </main>
      <SocialDock homeHref="/" />
    </>
  );
}
