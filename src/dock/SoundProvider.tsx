import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { SoundContext } from "./useSound";

const SOUND_STORAGE_KEY = "csy20-dock-sound";

function getInitialSoundPreference() {
  try {
    return window.localStorage.getItem(SOUND_STORAGE_KEY) !== "off";
  } catch {
    return true;
  }
}

export function SoundProvider({ children }: { children: ReactNode }) {
  const [soundEnabled, setSoundEnabled] = useState(getInitialSoundPreference);
  const enabledRef = useRef(soundEnabled);
  const contextRef = useRef<AudioContext | null>(null);
  const pendingTickRef = useRef<AudioContext | null>(null);

  const getContext = useCallback(() => {
    if (contextRef.current) return contextRef.current;

    try {
      const AudioCtx =
        window.AudioContext ||
        (window as Window & { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (AudioCtx) contextRef.current = new AudioCtx();
    } catch {
      // Audio is optional; unavailable APIs must not affect navigation.
    }

    return contextRef.current;
  }, []);

  const emitTick = useCallback((context: AudioContext) => {
    if (
      !enabledRef.current ||
      contextRef.current !== context ||
      context.state !== "running"
    )
      return;

    try {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = 1640;
      gain.gain.setValueAtTime(0.03, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(
        0.0008,
        context.currentTime + 0.045,
      );
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.onended = () => {
        oscillator.disconnect();
        gain.disconnect();
      };
      oscillator.start();
      oscillator.stop(context.currentTime + 0.05);
    } catch {
      // Audio failures must never interrupt a dock action.
    }
  }, []);

  const resumeContext = useCallback(
    (context: AudioContext) => {
      if (context.state === "closed") return;

      try {
        // Retry inside a trusted gesture even when an earlier hover's resume
        // is still waiting for the browser's autoplay permission.
        void context
          .resume()
          .then(() => {
            if (pendingTickRef.current !== context) return;
            pendingTickRef.current = null;
            emitTick(context);
          })
          .catch(() => {
            // Keep at most one pending tick for a later gesture to retry.
          });
      } catch {
        // A missing or blocked audio device must not affect navigation.
      }
    },
    [emitTick],
  );

  const playDockTick = useCallback(() => {
    if (!enabledRef.current) return;

    const context = getContext();
    if (!context) return;
    if (context.state === "running") {
      pendingTickRef.current = null;
      emitTick(context);
    } else if (context.state !== "closed") {
      // The first request survives initialization, without accumulating a
      // burst of sounds while the browser waits for a user interaction.
      pendingTickRef.current = context;
      resumeContext(context);
    }
  }, [emitTick, getContext, resumeContext]);

  useEffect(() => {
    const unlockAudio = (event: Event) => {
      if (!event.isTrusted || !enabledRef.current) return;

      const context = contextRef.current;
      if (context && context.state !== "running") resumeContext(context);
    };

    const syncPreference = (event: StorageEvent) => {
      if (event.key !== SOUND_STORAGE_KEY && event.key !== null) return;
      const enabled = event.newValue !== "off";
      enabledRef.current = enabled;
      if (!enabled) pendingTickRef.current = null;
      setSoundEnabled(enabled);
    };

    window.addEventListener("pointerdown", unlockAudio, { capture: true });
    window.addEventListener("keydown", unlockAudio, { capture: true });
    window.addEventListener("storage", syncPreference);

    return () => {
      window.removeEventListener("pointerdown", unlockAudio, { capture: true });
      window.removeEventListener("keydown", unlockAudio, { capture: true });
      window.removeEventListener("storage", syncPreference);
      const context = contextRef.current;
      contextRef.current = null;
      pendingTickRef.current = null;
      if (context) {
        try {
          void context.close().catch(() => {});
        } catch {
          // Closing an already unavailable context is harmless.
        }
      }
    };
  }, [resumeContext]);

  const toggleSound = useCallback(() => {
    const enabled = !enabledRef.current;
    enabledRef.current = enabled;
    setSoundEnabled(enabled);

    try {
      window.localStorage.setItem(SOUND_STORAGE_KEY, enabled ? "on" : "off");
    } catch {
      // Muting still works for this visit when storage is restricted.
    }

    if (enabled) playDockTick();
    else pendingTickRef.current = null;
  }, [playDockTick]);

  const value = useMemo(
    () => ({ soundEnabled, toggleSound, playDockTick }),
    [soundEnabled, toggleSound, playDockTick],
  );

  return (
    <SoundContext.Provider value={value}>{children}</SoundContext.Provider>
  );
}
