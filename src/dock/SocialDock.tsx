import { useEffect, useState, type PointerEvent, type ReactNode } from "react";
import { motion } from "framer-motion";
import { socialLinks } from "../data/siteContent";
import { useTheme } from "./useTheme";
import { Icon } from "./ui/Icon";
import { MoonIcon, SunIcon } from "./ui/ThemeIcons";
import { useSound } from "./useSound";

const dockLinks = socialLinks.filter(
  (link) => link.icon !== "instagram" && link.icon !== "linkedin",
);

function useDockMagnification() {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    let media: MediaQueryList;
    try {
      media = window.matchMedia(
        "(min-width: 640px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
      );
    } catch {
      return;
    }
    const update = () => setAllowed(media.matches);
    update();
    media.addEventListener?.("change", update);
    return () => media.removeEventListener?.("change", update);
  }, []);

  return allowed;
}

export function SocialDock() {
  const { theme, toggleTheme } = useTheme();
  const { playDockTick } = useSound();
  const canMagnify = useDockMagnification();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const controlMotion = (index: number) => {
    const distance =
      hoveredIndex === null ? Infinity : Math.abs(hoveredIndex - index);
    return {
      animate:
        canMagnify && distance < 2
          ? {
              scale: distance === 0 ? 1.18 : 1.08,
              y: distance === 0 ? -8 : -4,
            }
          : { scale: 1, y: 0 },
      transition: canMagnify
        ? { type: "spring" as const, stiffness: 400, damping: 28 }
        : { duration: 0 },
      ...(canMagnify ? { whileTap: { scale: 0.92 } } : {}),
      style: { transformOrigin: "bottom center" },
      onPointerEnter: (event: PointerEvent<HTMLElement>) => {
        if (event.pointerType === "touch") return;
        if (canMagnify) setHoveredIndex(index);
        playDockTick();
      },
    };
  };

  const icon = (node: ReactNode) => (
    <span className="dock-icon" aria-hidden="true">
      {node}
    </span>
  );

  return (
    <nav
      className="dock-shell"
      aria-label="Social shortcuts"
      onPointerLeave={() => setHoveredIndex(null)}
    >
      <motion.a
        className="dock-item"
        href="#hero"
        aria-label="Home"
        {...controlMotion(0)}
        onClick={playDockTick}
      >
        {icon(<Icon name="home" size={20} />)}
        <span className="dock-tooltip" aria-hidden="true">
          Home
        </span>
      </motion.a>
      {dockLinks.map((link, index) => {
        const external = !link.href.startsWith("mailto:");
        return (
          <motion.a
            key={link.icon}
            className="dock-item"
            href={link.href}
            target={external ? "_blank" : undefined}
            rel={external ? "noopener noreferrer" : undefined}
            aria-label={`${link.label}${external ? " (opens in a new tab)" : ""}`}
            {...controlMotion(index + 1)}
            onClick={playDockTick}
          >
            {icon(<Icon name={link.icon} size={20} />)}
            <span className="dock-tooltip" aria-hidden="true">
              {link.icon === "x"
                ? "X"
                : link.icon === "threads"
                  ? "Threads"
                  : link.label}
            </span>
          </motion.a>
        );
      })}
      <motion.button
        className="dock-item"
        type="button"
        aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
        {...controlMotion(dockLinks.length + 1)}
        onClick={(event) => {
          playDockTick();
          const rect = event.currentTarget.getBoundingClientRect();
          const origin =
            rect.width > 0 && rect.height > 0
              ? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
              : undefined;
          toggleTheme(origin);
        }}
      >
        {icon(theme === "dark" ? <SunIcon /> : <MoonIcon />)}
        <span className="dock-tooltip" aria-hidden="true">
          {theme === "dark" ? "Light theme" : "Dark theme"}
        </span>
      </motion.button>
    </nav>
  );
}
