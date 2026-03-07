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

const PER_PAGE = 20;

export interface UseEmailsResult {
  emails: Email[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
  updateEmails: (emailIds: string[], data: Record<string, unknown>) => Promise<void>;
  removeEmails: (emailIds: string[], data: Record<string, unknown>) => Promise<void>;
  page: number;
  setPage: (page: number) => void;
  hasNextPage: boolean;
}

export function useEmails(provider?: string, searchQuery?: string, folder?: string): UseEmailsResult {
  const { getToken } = useAuth();
  const { onNewEmails } = useEmailSync();
  const [emails, setEmails] = useState<Email[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);

  const [refetchTrigger, setRefetchTrigger] = useState(0);
  const refetch = useCallback(() => {
    setError(null);
    setRefetchTrigger((n) => n + 1);
  }, []);

  /** Patch emails in-place (e.g. mark read) without removing from list */
  const updateEmails = useCallback(
    async (emailIds: string[], data: Record<string, unknown>) => {
      const api = createApiClient(getToken);
      await Promise.all(emailIds.map((id) => api.patch(`/emails/${id}`, data)));
      if (data.is_read !== undefined) {
        setEmails((prev) =>
          prev.map((e) =>
            emailIds.includes(e.id) ? { ...e, is_read: data.is_read as boolean } : e,
          ),
        );
      }
    },
    [getToken],
  );

  /** Patch emails and optimistically remove them from the list (archive, trash) */
  const removeEmails = useCallback(
    async (emailIds: string[], data: Record<string, unknown>) => {
      const api = createApiClient(getToken);
      const snapshot = emails;
      setEmails((prev) => prev.filter((e) => !emailIds.includes(e.id)));
      try {
        await Promise.all(emailIds.map((id) => api.patch(`/emails/${id}`, data)));
      } catch {
        setEmails(snapshot);
        throw new Error("Failed to update emails");
      }
    },
    [getToken, emails],
  );

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [provider, searchQuery, folder]);

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
    if (folder) params.set("folder", folder);
    params.set("page", String(page));
    params.set("per_page", String(PER_PAGE));
    api
      .get<Email[]>(`/emails?${params.toString()}`)
      .then((res) => {
        const data = res ?? [];
        setEmails(data);
        setHasNextPage(data.length === PER_PAGE);
      })
      .catch((err) => {
        setError(err instanceof Error ? err : new Error("Unknown error"));
        setEmails([]);
        setHasNextPage(false);
      })
      .finally(() => setIsLoading(false));
  }, [refetchTrigger, getToken, provider, searchQuery, folder, page]);

  return { emails, isLoading, error, refetch, updateEmails, removeEmails, page, setPage, hasNextPage };
}
