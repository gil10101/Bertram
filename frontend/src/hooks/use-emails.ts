"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { createApiClient } from "@/lib/api-client";
import { useEmailSync } from "@/components/common/email-sync-provider";

export interface EmailSender {
  name: string;
  email: string;
}

export interface Email {
  id: string;
  thread_id?: string;
  subject: string;
  sender: EmailSender;
  snippet: string;
  is_read: boolean;
  is_starred: boolean;
  received_at: string;
  priority?: "high" | "medium" | "low";
  provider?: string;
}

export interface UseEmailsResult {
  emails: Email[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useEmails(provider?: string, searchQuery?: string): UseEmailsResult {
  const { getToken } = useAuth();
  const { onNewEmails } = useEmailSync();
  const [emails, setEmails] = useState<Email[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const [refetchTrigger, setRefetchTrigger] = useState(0);
  const refetch = useCallback(() => {
    setError(null);
    setRefetchTrigger((n) => n + 1);
  }, []);

  // Auto-refetch when SSE detects new emails
  useEffect(() => {
    return onNewEmails(refetch);
  }, [onNewEmails, refetch]);

  useEffect(() => {
    setIsLoading(true);
    const api = createApiClient(getToken);
    const params = new URLSearchParams();
    if (provider) params.set("provider", provider);
    if (searchQuery) params.set("q", searchQuery);
    const qs = params.toString() ? `?${params.toString()}` : "";
    api
      .get<Email[]>(`/emails${qs}`)
      .then((res) => setEmails(res ?? []))
      .catch((err) => {
        setError(err instanceof Error ? err : new Error("Unknown error"));
        setEmails([]);
      })
      .finally(() => setIsLoading(false));
  }, [refetchTrigger, getToken, provider, searchQuery]);

  return { emails, isLoading, error, refetch };
}
