"use client";

import { useActiveSection } from "./useActiveSection";

const links = [
  { id: "projects", label: "Work" },
  { id: "open-source", label: "Open source" },
  { id: "contact", label: "Contact" },
] as const;

const ids = links.map((link) => link.id);

export function SectionNav() {
  const active = useActiveSection(ids);

  return (
    <nav aria-label="Sections" className="hidden items-center gap-5 sm:flex">
      {links.map((link) => (
        <a
          key={link.id}
          href={`#${link.id}`}
          aria-current={active === link.id ? "location" : undefined}
          className="page-link border-b border-transparent pb-0.5 text-[13px] text-[var(--ink-faint)] transition-colors aria-[current=location]:border-[var(--accent)] aria-[current=location]:text-[var(--ink)]"
        >
          {link.label}
        </a>
      ))}
    </nav>
  );
}
