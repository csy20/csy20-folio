"use client";

import { MotionConfig } from "framer-motion";
import { MotionConfig as PageMotionConfig } from "motion/react";
import type { ReactNode } from "react";
import { SoundProvider } from "@/dock/SoundProvider";
import { ThemeProvider } from "@/dock/ThemeProvider";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <PageMotionConfig reducedMotion="user">
        <ThemeProvider>
          <SoundProvider>{children}</SoundProvider>
        </ThemeProvider>
      </PageMotionConfig>
    </MotionConfig>
  );
}
