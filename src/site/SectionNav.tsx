"use client";

import { useActiveSection } from "./useActiveSection";

const links = [
  { id: "projects", label: "Work", short: "Work" },
  { id: "open-source", label: "Open source", short: "OSS" },
  { id: "contact", label: "Contact", short: "Contact" },
] as const;

const ids = links.map((link) => link.id);

export function SectionNav() {
  const active = useActiveSection(ids);

  return (
    <nav aria-label="Sections" className="flex items-center gap-2.5 sm:gap-5">
      {links.map((link) => (
        <a
          key={link.id}
          href={`#${link.id}`}
          aria-current={active === link.id ? "location" : undefined}
          className="page-link border-b border-transparent pb-0.5 text-[12.5px] text-[var(--ink-faint)] transition-colors aria-[current=location]:border-[var(--accent)] aria-[current=location]:text-[var(--ink)] sm:text-[13px]"
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
    </nav>
  );
}
