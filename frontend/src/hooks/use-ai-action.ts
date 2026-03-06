"use client";

import { useState, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { createApiClient } from "@/lib/api-client";

interface AiActionResult {
  data: string | null;
  isLoading: boolean;
  error: Error | null;
  execute: (id: string, instructions?: string) => void;
}

function useAiAction(endpoint: string, provider?: string): AiActionResult {
  const { getToken } = useAuth();
  const [data, setData] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(
    async (id: string, instructions?: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const api = createApiClient(getToken);
        const qs = provider ? `?provider=${provider}` : "";
        const result = await api.post<Record<string, string>>(
          `/ai/${endpoint}/${id}${qs}`,
          { instructions },
        );
        setData(result.summary ?? result.draft ?? JSON.stringify(result));
      } catch (err) {
        setError(err instanceof Error ? err : new Error("AI action failed"));
      } finally {
        setIsLoading(false);
      }
    },
    [endpoint, getToken, provider],
  );

  return { data, isLoading, error, execute };
}

export function useAiSummary(_emailId?: string, provider?: string) {
  return useAiAction("summarize", provider);
}

export function useAiDraft(_emailId?: string, provider?: string) {
  return useAiAction("draft-reply", provider);
}
