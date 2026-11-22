"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { useActiveSection } from "./useActiveSection";

const links = [
  { id: "projects", label: "Work", short: "Work" },
  { id: "open-source", label: "Open source", short: "OSS" },
  { id: "contact", label: "Contact", short: "Contact" },
] as const;

const ids = links.map((link) => link.id);

export function SectionNav() {
  const active = useActiveSection(ids);
  const navRef = useRef<HTMLElement>(null);
  const linkRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const [indicator, setIndicator] = useState<{
    left: number;
    width: number;
    visible: boolean;
  }>({ left: 0, width: 0, visible: false });

  useLayoutEffect(() => {
    const measure = () => {
      const nav = navRef.current;
      const target = active ? linkRefs.current[active] : null;
      if (!nav || !target) {
        setIndicator((prev) => (prev.visible ? { ...prev, visible: false } : prev));
        return;
      }
      const navRect = nav.getBoundingClientRect();
      const rect = target.getBoundingClientRect();
      if (rect.width === 0) return;
      setIndicator({
        left: rect.left - navRect.left,
        width: rect.width,
        visible: true,
      });
    };

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [active]);

  return (
    <nav
      ref={navRef}
      aria-label="Sections"
      className="relative flex items-center gap-2 sm:gap-5"
    >
      {links.map((link) => (
        <a
          key={link.id}
          ref={(node) => {
            linkRefs.current[link.id] = node;
          }}
          href={`#${link.id}`}
          aria-current={active === link.id ? "location" : undefined}
          className={`page-link border-b border-transparent pb-0.5 text-[12.5px] text-[var(--ink-faint)] transition-colors duration-150 aria-[current=location]:text-[var(--ink)] sm:text-[13px] ${
            indicator.visible
              ? ""
              : "aria-[current=location]:border-[var(--accent)]"
          }`}
        >
          {link.short !== link.label ? (
            <>
              <span className="sm:hidden" aria-hidden="true">
                {link.short}
              </span>
              <span className="max-sm:sr-only">{link.label}</span>
            </>
          ) : (
            link.label
          )}
        </a>
      ))}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-0 h-[1.5px] origin-left bg-[var(--accent)] transition-[transform,opacity] duration-250 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
        style={{
          width: "1px",
          opacity: indicator.visible ? 1 : 0,
          transform: `translate3d(${indicator.left}px, 0, 0) scaleX(${indicator.width})`,
        }}
      />
    </nav>
  );
}
