import { createContext, useContext } from "react";

export type SoundTone =
  | { kind: "dock"; index: number }
  | { kind: "hop"; step: number }
  | { kind: "complete" }
  | { kind: "stale" }
  | { kind: "fresh" }
  | { kind: "calendar"; level: number; merged?: boolean }
  | { kind: "theme"; next: "light" | "dark" };

export type SoundContextValue = {
  soundEnabled: boolean;
  toggleSound: () => void;
  playDockTick: () => void;
  playTone?: (tone: SoundTone) => void;
};

export const SoundContext = createContext<SoundContextValue | undefined>(
  undefined,
);

export function useSound() {
  const context = useContext(SoundContext);

  if (!context) {
    throw new Error("useSound must be used within SoundProvider");
  }

  return context;
}
