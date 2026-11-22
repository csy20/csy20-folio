import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { SoundContext, type SoundTone } from "./useSound";

const SOUND_STORAGE_KEY = "csy20-dock-sound";

// Pentatonic glass/marimba frequencies for musical tactile cues.
const DOCK_SCALE = [1046.5, 1174.7, 1318.5, 1568.0, 1760.0, 2093.0, 2349.3] as const;
const HOP_SCALE = [587.3, 659.3, 784.0, 880.0, 1046.5, 1174.7] as const;
const CALENDAR_SCALE = [440.0, 587.3, 739.9, 880.0, 1174.7] as const;

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

  const emitNote = useCallback(
    (
      context: AudioContext,
      freq: number,
      peakGain: number,
      durationSec: number,
      delaySec = 0,
      type: OscillatorType = "sine",
    ) => {
      if (
        !enabledRef.current ||
        contextRef.current !== context ||
        context.state !== "running"
      ) {
        return;
      }
      try {
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        const startAt = context.currentTime + delaySec;
        oscillator.type = type;
        oscillator.frequency.value = freq;
        gain.gain.setValueAtTime(peakGain, startAt);
        gain.gain.exponentialRampToValueAtTime(0.0008, startAt + durationSec);
        oscillator.connect(gain);
        gain.connect(context.destination);
        oscillator.onended = () => {
          oscillator.disconnect();
          gain.disconnect();
        };
        oscillator.start(startAt);
        oscillator.stop(startAt + durationSec + 0.008);
      } catch {
        // Audio failures must never interrupt interaction.
      }
    },
    [],
  );

  const playTone = useCallback(
    (tone: SoundTone) => {
      if (!enabledRef.current) return;
      const context = getContext();
      if (!context) return;
      if (context.state !== "running") {
        if (context.state !== "closed") {
          pendingTickRef.current = context;
          resumeContext(context);
        }
        return;
      }

      switch (tone.kind) {
        case "dock": {
          const freq = DOCK_SCALE[tone.index % DOCK_SCALE.length] ?? 1640;
          emitNote(context, freq, 0.024, 0.052, 0, "sine");
          break;
        }
        case "hop": {
          const freq = HOP_SCALE[Math.min(tone.step, HOP_SCALE.length - 1)] ?? 880;
          emitNote(context, freq, 0.026, 0.06, 0, "triangle");
          break;
        }
        case "complete": {
          emitNote(context, 880, 0.024, 0.09, 0, "sine");
          emitNote(context, 1318.5, 0.022, 0.12, 0.045, "sine");
          break;
        }
        case "stale": {
          emitNote(context, 340, 0.028, 0.06, 0, "triangle");
          emitNote(context, 265, 0.024, 0.08, 0.055, "triangle");
          break;
        }
        case "fresh": {
          emitNote(context, 784, 0.022, 0.065, 0, "sine");
          emitNote(context, 1174.7, 0.024, 0.095, 0.05, "sine");
          break;
        }
        case "calendar": {
          const idx = Math.max(0, Math.min(CALENDAR_SCALE.length - 1, tone.level));
          const freq = CALENDAR_SCALE[idx] ?? 587.3;
          emitNote(context, freq, tone.level === 0 ? 0.009 : 0.018, 0.042, 0, "sine");
          if (tone.merged) {
            emitNote(context, freq * 1.5, 0.016, 0.08, 0.028, "sine");
          }
          break;
        }
        case "theme": {
          if (tone.next === "light") {
            emitNote(context, 740, 0.022, 0.065, 0, "sine");
            emitNote(context, 1108.7, 0.02, 0.09, 0.04, "sine");
          } else {
            emitNote(context, 659.3, 0.022, 0.065, 0, "sine");
            emitNote(context, 440, 0.022, 0.09, 0.04, "sine");
          }
          break;
        }
      }
    },
    [emitNote, getContext, resumeContext],
  );

  const value = useMemo(
    () => ({ soundEnabled, toggleSound, playDockTick, playTone }),
    [soundEnabled, toggleSound, playDockTick, playTone],
  );

  return (
    <SoundContext.Provider value={value}>{children}</SoundContext.Provider>
  );
}
