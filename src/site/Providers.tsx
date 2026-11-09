"use client";

import type { ReactNode } from "react";
import { SoundProvider } from "@/dock/SoundProvider";
import { ThemeProvider } from "@/dock/ThemeProvider";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <SoundProvider>{children}</SoundProvider>
    </ThemeProvider>
  );
}
