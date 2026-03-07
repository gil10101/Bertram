"use client";

import { createContext, useContext, useState, useCallback } from "react";
import type { ComposeData } from "@/types/email";

interface ComposeContextValue {
  isComposeOpen: boolean;
  composeData: ComposeData | null;
  openCompose: (data?: ComposeData) => void;
  closeCompose: () => void;
}

const ComposeContext = createContext<ComposeContextValue>({
  isComposeOpen: false,
  composeData: null,
  openCompose: () => {},
  closeCompose: () => {},
});

export function useCompose() {
  return useContext(ComposeContext);
}

export function ComposeProvider({ children }: { children: React.ReactNode }) {
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [composeData, setComposeData] = useState<ComposeData | null>(null);

  const openCompose = useCallback((data?: ComposeData) => {
    setComposeData(data ?? null);
    setIsComposeOpen(true);
  }, []);

  const closeCompose = useCallback(() => {
    setIsComposeOpen(false);
    setComposeData(null);
  }, []);

  return (
    <ComposeContext.Provider value={{ isComposeOpen, composeData, openCompose, closeCompose }}>
      {children}
    </ComposeContext.Provider>
  );
}
