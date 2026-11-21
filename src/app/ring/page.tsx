import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { config } from "@/config";
import { NETWORK_NAME, networkSites } from "@/data/network";
import { profile, resumeUrl } from "@/data/siteContent";
import { SocialDock } from "@/dock/SocialDock";
import { IndiaClock } from "@/site/IndiaClock";

const title = `${NETWORK_NAME} · ${profile.name}`;
const description =
  "All websites, apps, and web tools built and maintained by Chitresh Yadav.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/ring" },
  openGraph: {
    type: "website",
    url: "/ring",
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

export default function RingPage() {
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

        <section aria-labelledby="ring-heading" className="pt-12 sm:pt-20">
          <p className="font-mono text-[11px] tracking-[0.08em] text-[var(--ink-faint)] uppercase">
            Connected network · {networkSites.length} sites
          </p>
          <h1
            id="ring-heading"
            className="mt-2 text-[2.2rem] leading-[1.02] font-medium tracking-[-0.045em] text-[var(--ink)] sm:text-[2.85rem]"
          >
            {NETWORK_NAME}
          </h1>
          <p className="mt-4 max-w-[48ch] text-[15px] leading-7 text-[var(--ink-soft)]">
            Every website, product page, and web tool I maintain in one place.
          </p>

          <ol className="mt-10 flex flex-col">
            {networkSites.map((site, index) => {
              const isHub = site.id === "csy20";
              const order = String(index + 1).padStart(2, "0");

              return (
                <li
                  key={site.id}
                  className="draw-row border-t border-[var(--line)] py-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 items-start gap-3.5">
                      <span className="mt-2.5 hidden font-mono text-[11px] tabular-nums text-[var(--ink-faint)] sm:inline">
                        {order}
                      </span>
                      <span
                        className={`work-logo relative mt-0.5 block size-10 shrink-0 overflow-hidden rounded-[0.8rem] ${
                          site.iconWell === "light"
                            ? "bg-white"
                            : "bg-[var(--logo-well)]"
                        }`}
                      >
                        <Image
                          src={site.icon}
                          alt=""
                          width={80}
                          height={80}
                          unoptimized
                          className="size-full object-cover"
                        />
                      </span>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="draw-link text-[15.5px] font-medium tracking-[-0.02em] text-[var(--ink)]">
                            {site.name}
                          </h2>
                          <span className="rounded border border-[var(--line)] bg-[var(--card)] px-1.5 py-0.5 font-mono text-[10.5px] text-[var(--ink-faint)]">
                            {site.category}
                          </span>
                          {isHub ? (
                            <span className="font-mono text-[10.5px] text-[var(--accent)]">
                              hub
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-1 max-w-[48ch] text-[13.5px] leading-5 text-[var(--ink-soft)]">
                          {site.tagline}
                        </p>
                      </div>
                    </div>

                    {isHub ? (
                      <Link
                        href="/"
                        className="page-link mt-1 shrink-0 font-mono text-[12px] text-[var(--ink-faint)]"
                      >
                        {site.domain}
                      </Link>
                    ) : (
                      <a
                        href={site.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="page-link mt-1 shrink-0 font-mono text-[12px] text-[var(--ink-faint)]"
                      >
                        {site.domain} ↗
                      </a>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>

          <div className="mt-10 rounded-xl border border-[var(--line)] bg-[var(--card)] p-4 font-mono text-[11.5px] leading-6 text-[var(--ink-faint)]">
            <p className="text-[var(--ink-soft)]">Manifest</p>
            <p className="mt-1 break-all">
              <a
                href="/ring.json"
                className="page-link text-[var(--ink)] underline decoration-[var(--line)] underline-offset-4"
              >
                {config.siteUrl}/ring.json
              </a>
            </p>
          </div>
        </section>
      </main>
      <SocialDock homeHref="/" />
    </>
  );
}
