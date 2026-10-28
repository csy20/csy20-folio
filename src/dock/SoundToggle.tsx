import { useSound } from "./useSound";

export function SoundToggle() {
  const { soundEnabled, toggleSound } = useSound();

  return (
    <button
      className="dock-sound-toggle"
      type="button"
      aria-label={soundEnabled ? "Mute dock sound" : "Enable dock sound"}
      onClick={toggleSound}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M11 5 6 9H3v6h3l5 4V5Z" />
        {soundEnabled ? (
          <path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" />
        ) : (
          <path d="m16 9 5 6m0-6-5 6" />
        )}
      </svg>
      Dock sound: {soundEnabled ? "on" : "off"}
    </button>
  );
}
