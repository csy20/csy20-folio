"use client";

import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";
import { SoundProvider } from "@/dock/SoundProvider";
import { ThemeProvider } from "@/dock/ThemeProvider";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <ThemeProvider>
        <SoundProvider>{children}</SoundProvider>
      </ThemeProvider>
    </MotionConfig>
  );
}
