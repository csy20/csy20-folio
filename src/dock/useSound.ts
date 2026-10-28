import { createContext, useContext } from "react";

export type SoundContextValue = {
  soundEnabled: boolean;
  toggleSound: () => void;
  playDockTick: () => void;
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
