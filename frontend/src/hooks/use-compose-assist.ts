"use client";

import { useState, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { createApiClient } from "@/lib/api-client";

interface ComposeAssistParams {
  subject: string;
  body: string;
  instructions: string;
  attachments: File[];
}

interface ComposeAssistResult {
  draftBody: string | null;
  isLoading: boolean;
  error: Error | null;
  execute: (params: ComposeAssistParams) => Promise<void>;
}

export function useComposeAssist(): ComposeAssistResult {
  const { getToken } = useAuth();
  const [draftBody, setDraftBody] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(
    async ({ subject, body, instructions, attachments }: ComposeAssistParams) => {
      setIsLoading(true);
      setError(null);
      try {
        const api = createApiClient(getToken);
        const formData = new FormData();
        formData.append(
          "data",
          JSON.stringify({ subject, body, instructions }),
        );
        for (const file of attachments) {
          formData.append("files", file);
        }
        const result = await api.postForm<{ draft_body: string }>(
          "/ai/compose-assist",
          formData,
        );
        setDraftBody(result.draft_body);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("AI assist failed"),
        );
      } finally {
        setIsLoading(false);
      }
    },
    [getToken],
  );

  return { draftBody, isLoading, error, execute };
}
