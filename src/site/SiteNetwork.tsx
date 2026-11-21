"use client";

import Image from "next/image";
import Link from "next/link";
import { useContext, useState } from "react";
import { networkSites, type NetworkSiteId } from "@/data/network";
import { SoundContext } from "@/dock/useSound";

export function SiteNetwork({
  currentSiteId = "csy20",
}: {
  currentSiteId?: NetworkSiteId;
}) {
  const sound = useContext(SoundContext);
  const [dismissedTooltip, setDismissedTooltip] = useState(false);

  const playTick = () => {
    sound?.playDockTick();
  };

  return (
    <div
      className="flex items-center gap-2.5"
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          setDismissedTooltip(true);
        }
      }}
    >
      <Link
        href="/ring"
        aria-label={`View all ${networkSites.length} connected sites`}
        onClick={playTick}
        className="page-link text-[13px] text-[var(--ink-faint)] transition-colors"
      >
        Sites
      </Link>
      <div
        className={`network-stack flex items-center -space-x-1.5 ${
          dismissedTooltip ? "is-dismissed" : ""
        }`}
        onPointerLeave={() => setDismissedTooltip(false)}
        onBlur={() => setDismissedTooltip(false)}
      >
        {networkSites.map((site, index) => {
          const isCurrent = site.id === currentSiteId;
          const isFirst = index === 0;
          const isLast = index === networkSites.length - 1;
          const tooltipAnchorClass = isFirst
            ? "network-tooltip-start"
            : isLast
              ? "network-tooltip-end"
              : "network-tooltip-center";

          return (
            <a
              key={site.id}
              href={isCurrent ? "#hero" : site.url}
              {...(isCurrent
                ? { "aria-current": "page" as const }
                : { target: "_blank", rel: "noopener noreferrer" })}
              aria-label={
                isCurrent
                  ? `${site.name} — current site`
                  : `${site.name} — ${site.domain} (opens in a new tab)`
              }
              onPointerEnter={(event) => {
                setDismissedTooltip(false);
                if (event.pointerType !== "touch") {
                  playTick();
                }
              }}
              onFocus={() => setDismissedTooltip(false)}
              onClick={playTick}
              className={`network-avatar group relative block size-7 shrink-0 rounded-full ring-2 ring-[var(--page-bg)] ${
                site.iconWell === "light"
                  ? "bg-white"
                  : "bg-[var(--logo-well)]"
              }`}
            >
              <span className="network-avatar-well relative block size-full overflow-hidden rounded-full">
                <Image
                  src={site.icon}
                  alt=""
                  width={56}
                  height={56}
                  unoptimized
                  className="size-full object-cover"
                />
              </span>
              <span
                aria-hidden="true"
                className={`network-tooltip ${tooltipAnchorClass}`}
              >
                <span className="font-medium">{site.name}</span>
                <span className="network-tooltip-meta">
                  {isCurrent ? "here" : site.domain}
                </span>
              </span>
            </a>
          );
        })}
      </div>
    </div>
  );
}
