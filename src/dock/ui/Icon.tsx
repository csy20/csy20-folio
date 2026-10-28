import { memo } from "react";
import type { StackItem, SocialIcon } from "../../data/siteContent";

type IconName =
  | StackItem["icon"]
  | SocialIcon
  | "link"
  | "arrow-right"
  | "external-link"
  | "play"
  | "download"
  | "home"
  | "star";

function RawIcon({ name, size = 18 }: { name: IconName; size?: number }) {
  switch (name) {
    case "html":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <path
            d="M4 3h16l-1.5 16.5L12 21l-6.5-1.5L4 3z"
            fill="currentColor"
            opacity="0.15"
          />
          <path
            d="M4 3h16l-1.5 16.5L12 21l-6.5-1.5L4 3z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path
            d="M8 7h8l-.5 5.5L12 14l-3.5-1.5L8 7z"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "css":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <path
            d="M4 3h16l-1.5 16.5L12 21l-6.5-1.5L4 3z"
            fill="currentColor"
            opacity="0.15"
          />
          <path
            d="M4 3h16l-1.5 16.5L12 21l-6.5-1.5L4 3z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path
            d="M12 14l3.5-1.5.5-4H8l.5 3.5h4l-.5 2z"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "javascript":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <rect
            x="2"
            y="2"
            width="20"
            height="20"
            rx="2"
            fill="currentColor"
            opacity="0.12"
          />
          <path d="M8 17V7h2l3 6V7h2v10h-2l-3-6v6H8z" fill="currentColor" />
        </svg>
      );
    case "typescript":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <rect
            x="2"
            y="2"
            width="20"
            height="20"
            rx="2"
            fill="currentColor"
            opacity="0.12"
          />
          <path
            d="M8 17v-1.5h2.5V12H8v-1.5h4V17H8zm6-6V9.5h3V8h-5v3h2.5v1H12v3h5v-3h-3z"
            fill="currentColor"
          />
        </svg>
      );
    case "jsx":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <path
            d="M12 2L2 7v10l10 5 10-5V7L12 2z"
            fill="currentColor"
            opacity="0.12"
          />
          <path
            d="M12 2L2 7v10l10 5 10-5V7L12 2z"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
          <path
            d="M12 7v5l3 2"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="12" r="1.2" fill="currentColor" />
        </svg>
      );
    case "tsx":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <path
            d="M12 2L2 7v10l10 5 10-5V7L12 2z"
            fill="currentColor"
            opacity="0.12"
          />
          <path
            d="M12 2L2 7v10l10 5 10-5V7L12 2z"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
          <path
            d="M12 7v5l3 2"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="12" r="1.2" fill="currentColor" />
          <path
            d="M8 3.5h2v1h1.5v1h-2V7H8V5.5H6.5v-1H8V3.5z"
            fill="currentColor"
          />
        </svg>
      );
    case "nextjs":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.12" />
          <path
            d="M11.5 8v8h-1.2l-4.3-5.4V16H5V8h1.2l4.3 5.4V8h1zM17 15.5c-.4 0-.7-.1-1-.3s-.5-.5-.6-.9h1.2c0 .2.1.4.2.5s.3.2.5.2.4-.1.5-.2.2-.4.2-.6-.1-.4-.2-.5-.3-.2-.5-.2-.4.1-.5.2-.2.3-.2.6h-1.1c0-.4.1-.7.3-1s.5-.5.8-.6.7-.1 1-.1.7.1 1 .3.5.5.6.8.1.7 0 1-.1.6-.3.8-.5.4-.9.4z"
            fill="currentColor"
          />
        </svg>
      );
    case "react":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="2.5" fill="currentColor" />
          <ellipse
            cx="12"
            cy="12"
            rx="10"
            ry="4"
            stroke="currentColor"
            strokeWidth="1.3"
            fill="none"
          />
          <ellipse
            cx="12"
            cy="12"
            rx="10"
            ry="4"
            stroke="currentColor"
            strokeWidth="1.3"
            fill="none"
            transform="rotate(60, 12, 12)"
          />
          <ellipse
            cx="12"
            cy="12"
            rx="10"
            ry="4"
            stroke="currentColor"
            strokeWidth="1.3"
            fill="none"
            transform="rotate(120, 12, 12)"
          />
        </svg>
      );
    case "reactnative":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="1.5" fill="currentColor" />
          <ellipse
            cx="12"
            cy="12"
            rx="9.5"
            ry="3.5"
            stroke="currentColor"
            strokeWidth="1.3"
            fill="none"
          />
          <ellipse
            cx="12"
            cy="12"
            rx="9.5"
            ry="3.5"
            stroke="currentColor"
            strokeWidth="1.3"
            fill="none"
            transform="rotate(60, 12, 12)"
          />
          <ellipse
            cx="12"
            cy="12"
            rx="9.5"
            ry="3.5"
            stroke="currentColor"
            strokeWidth="1.3"
            fill="none"
            transform="rotate(120, 12, 12)"
          />
        </svg>
      );
    case "mongodb":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <path
            d="M12 2C8.5 2 6 6 6 10c0 3 1.5 5.5 4 7.5L12 22l2-4.5c2.5-2 4-4.5 4-7.5C18 6 15.5 2 12 2z"
            stroke="currentColor"
            strokeWidth="1.4"
            fill="currentColor"
            opacity="0.12"
          />
          <path
            d="M12 22l-2-4.5C7.5 15.5 6 13 6 10c0-4 2.5-8 6-8"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </svg>
      );
    case "express":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <path
            d="M4 17V7h3l3 4 3-4h3v10h-3v-6l-3 4-3-4v6H4z"
            stroke="currentColor"
            strokeWidth="1.4"
            fill="currentColor"
            opacity="0.1"
          />
        </svg>
      );
    case "ubuntu":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="1.4"
          />
          <circle
            cx="12"
            cy="12"
            r="3.5"
            stroke="currentColor"
            strokeWidth="1.2"
            fill="currentColor"
            opacity="0.15"
          />
          <circle cx="12" cy="6.5" r="1.5" fill="currentColor" opacity="0.8" />
          <circle cx="7" cy="15" r="1.5" fill="currentColor" opacity="0.8" />
          <circle cx="17" cy="15" r="1.5" fill="currentColor" opacity="0.8" />
        </svg>
      );
    case "flutter":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <path
            d="M6 20l8-8H4l10-10v8l-8 10z"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinejoin="round"
            fill="currentColor"
            opacity="0.1"
          />
          <path
            d="M14 12l6-6-6 6z"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
          <path
            d="M4 12h10l-4 8 4-8z"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "go":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <circle
            cx="9"
            cy="9"
            r="5.5"
            stroke="currentColor"
            strokeWidth="1.4"
          />
          <circle
            cx="15"
            cy="15"
            r="5.5"
            stroke="currentColor"
            strokeWidth="1.4"
          />
          <path d="M12.5 12.5l2 2" stroke="currentColor" strokeWidth="1.2" />
        </svg>
      );
    case "firebase":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <path
            d="M4 18l4-14 4 8 4-10 4 16H4z"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinejoin="round"
            fill="currentColor"
            opacity="0.1"
          />
        </svg>
      );
    case "supabase":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <path
            d="M5 20h14L12 4 5 20z"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinejoin="round"
            fill="currentColor"
            opacity="0.1"
          />
          <path
            d="M5 20L12 8l7 12H5z"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "dart":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="1.4"
          />
          <path
            d="M12 2c-2 4-2 8 0 10s2 6 0 10"
            stroke="currentColor"
            strokeWidth="1.2"
            fill="currentColor"
            opacity="0.08"
          />
          <path
            d="M2 12c4-2 8-2 10 0s6 2 10 0"
            stroke="currentColor"
            strokeWidth="1.2"
          />
        </svg>
      );
    case "tailwindcss":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <path
            d="M12 6C9.5 6 8 7.5 7.5 10c.9-1.3 2-1.8 3.2-1.4.7.2 1.2.7 1.7 1.2.9.9 2 1.9 4.1 1.9 2.5 0 4-1.5 4.5-4-.9 1.3-2 1.8-3.2 1.4-.7-.2-1.2-.7-1.7-1.2-.9-.9-2-1.9-4.1-1.9z"
            fill="currentColor"
          />
        </svg>
      );
    case "python":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <path
            d="M12 2C8 2 7 3.5 7 5.5V9h5v1H6.5C4.5 10 4 11.5 4 13s.5 3 2.5 3H8v-2c0-1 .5-2 1.5-2h4c1.8 0 3.5-1.5 3.5-3.5S15.3 5 12.5 5c-1.1 0-3.5.5-3.5 1.5V9"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12 22c4 0 5-1.5 5-3.5V15h-5v-1h6.5c2 0 1.5-1.5 1.5-3s-.5-3-2.5-3H16v2c0 1-.5 2-1.5 2h-4c-1.8 0-3.5 1.5-3.5 3.5S8.7 19 11.5 19c1.1 0 3.5-.5 3.5-1.5V15"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "rust":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <circle
            cx="12"
            cy="12"
            r="7.5"
            stroke="currentColor"
            strokeWidth="1.4"
          />
          <circle
            cx="12"
            cy="12"
            r="3"
            stroke="currentColor"
            strokeWidth="1.2"
            fill="currentColor"
            opacity="0.12"
          />
          <path
            d="M12 3.5v2.2M12 18.3v2.2M3.5 12h2.2M18.3 12h2.2M6.1 6.1l1.6 1.6M16.3 16.3l1.6 1.6M17.9 6.1l-1.6 1.6M7.7 16.3l-1.6 1.6"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinecap="round"
          />
        </svg>
      );
    case "github":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M12 2C6.5 2 2 6.5 2 12c0 4.4 2.9 8.2 6.8 9.5.5.1.7-.2.7-.5v-1.7c-2.8.6-3.4-1.3-3.4-1.3-.5-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.5 2.4 1.1 3 .8.1-.7.4-1.1.7-1.4-2.3-.3-4.7-1.2-4.7-5.1 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.7 0 0 .8-.3 2.7 1a9.3 9.3 0 0 1 5 0c2-1.3 2.8-1 2.8-1 .5 1.4.2 2.4.1 2.7.7.7 1 1.6 1 2.7 0 3.9-2.4 4.8-4.7 5 .4.3.7 1 .7 2v3c0 .3.2.6.7.5 4-1.3 6.8-5.1 6.8-9.5C22 6.5 17.5 2 12 2z"
            fill="currentColor"
          />
        </svg>
      );
    case "linkedin":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <rect
            x="2"
            y="2"
            width="20"
            height="20"
            rx="3"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="M7 10v7M7 7v.01M12 17v-4.5a2 2 0 0 1 4 0V17"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "x":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M4 4l6.5 8.5L4 20h1.5l5.7-6.6L15.5 20H20l-6.8-9L19 4h-1.5l-5.4 6.2L8.5 4H4zm2.7 1.1h2.1l9.1 13.8h-2.1L6.7 5.1z"
            fill="currentColor"
          />
        </svg>
      );
    case "email":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <rect
            x="2"
            y="5"
            width="20"
            height="14"
            rx="3"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="M2 7l8 6c1.2.8 2.8.8 4 0l8-6"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "docker":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <rect
            x="1"
            y="5"
            width="6"
            height="5"
            rx="1.5"
            fill="currentColor"
            opacity="0.7"
          />
          <rect
            x="8"
            y="5"
            width="6"
            height="5"
            rx="1.5"
            fill="currentColor"
            opacity="0.7"
          />
          <rect
            x="15"
            y="5"
            width="6"
            height="5"
            rx="1.5"
            fill="currentColor"
            opacity="0.7"
          />
          <rect
            x="4"
            y="11"
            width="5"
            height="4"
            rx="1.2"
            fill="currentColor"
            opacity="0.7"
          />
          <rect
            x="10"
            y="11"
            width="5"
            height="4"
            rx="1.2"
            fill="currentColor"
            opacity="0.7"
          />
          <rect
            x="16"
            y="11"
            width="4"
            height="4"
            rx="1.2"
            fill="currentColor"
            opacity="0.7"
          />
          <rect
            x="6"
            y="16"
            width="3"
            height="3"
            rx="1"
            fill="currentColor"
            opacity="0.7"
          />
          <rect
            x="11"
            y="16"
            width="3"
            height="3"
            rx="1"
            fill="currentColor"
            opacity="0.7"
          />
          <rect
            x="17"
            y="16"
            width="3"
            height="3"
            rx="1"
            fill="currentColor"
            opacity="0.7"
          />
          <path
            d="M2 15h1m18-4h1m-6-2h1M5 8h1m10 0h1"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinecap="round"
            opacity="0.4"
          />
        </svg>
      );
    case "link":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M10 5H7a5 5 0 0 0 0 10h3M14 5h3a5 5 0 0 1 0 10h-3M8 12h8"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "arrow-right":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      );
    case "external-link":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" />
        </svg>
      );
    case "play":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon points="5 3 19 12 5 21 5 3" />
        </svg>
      );
    case "download":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
        </svg>
      );
    case "home":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      );
    case "star":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      );
    case "youtube":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <rect
            x="2"
            y="4"
            width="20"
            height="16"
            rx="4"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="M10 8.5l7 3.5-7 3.5V8.5z"
            fill="currentColor"
            stroke="none"
          />
        </svg>
      );
    case "threads":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.964-.065-1.19.408-2.285 1.33-3.082.88-.76 2.119-1.207 3.583-1.291a13.853 13.853 0 0 1 3.02.142c-.126-.742-.375-1.332-.75-1.757-.513-.586-1.308-.883-2.359-.89h-.029c-.844 0-1.992.232-2.721 1.32L7.734 7.847c.98-1.454 2.568-2.256 4.478-2.256h.044c3.194.02 5.097 1.975 5.287 5.388.108.046.216.094.321.142 1.49.7 2.58 1.761 3.154 3.07.797 1.82.871 4.79-1.548 7.158-1.85 1.81-4.094 2.628-7.277 2.65Zm1.003-11.69c-.242 0-.487.007-.739.021-1.836.103-2.98.946-2.916 2.143.067 1.256 1.452 1.839 2.784 1.767 1.224-.065 2.818-.543 3.086-3.71a10.5 10.5 0 0 0-2.215-.221z"
            fill="currentColor"
          />
        </svg>
      );
    case "instagram":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <rect
            x="2"
            y="2"
            width="20"
            height="20"
            rx="5"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <circle
            cx="12"
            cy="12"
            r="4.5"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <circle
            cx="17.5"
            cy="6.5"
            r="1.2"
            fill="currentColor"
            stroke="none"
          />
        </svg>
      );
    default: {
      const _exhaustive: never = name;
      void _exhaustive;
      return null;
    }
  }
}

function IconInner({ name, size = 18 }: { name: IconName; size?: number }) {
  return (
    <span className="inline-flex shrink-0" aria-hidden="true">
      <RawIcon name={name} size={size} />
    </span>
  );
}

export const Icon = memo(IconInner);
