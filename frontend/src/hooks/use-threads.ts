"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { createApiClient } from "@/lib/api-client";
import type { ThreadSummary, ThreadDetail } from "@/types/email";

export interface UseThreadsResult {
  threads: ThreadSummary[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useThreads(provider?: string): UseThreadsResult {
  const { getToken } = useAuth();
  const [threads, setThreads] = useState<ThreadSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const [refetchTrigger, setRefetchTrigger] = useState(0);
  const refetch = useCallback(() => {
    setError(null);
    setRefetchTrigger((n) => n + 1);
  }, []);

  useEffect(() => {
    setIsLoading(true);
    const api = createApiClient(getToken);
    const qs = provider ? `?provider=${provider}` : "";
    api
      .get<ThreadSummary[]>(`/threads${qs}`)
      .then((res) => setThreads(res ?? []))
      .catch((err) => {
        setError(err instanceof Error ? err : new Error("Unknown error"));
        setThreads([]);
      })
      .finally(() => setIsLoading(false));
  }, [refetchTrigger, getToken, provider]);

  return { threads, isLoading, error, refetch };
}

export interface UseThreadResult {
  thread: ThreadDetail | null;
  isLoading: boolean;
  error: Error | null;
}

export function useThread(
  threadId: string | undefined,
  provider?: string,
): UseThreadResult {
  const { getToken } = useAuth();
  const [thread, setThread] = useState<ThreadDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!threadId) return;
    setIsLoading(true);
    setError(null);
    const api = createApiClient(getToken);
    const qs = provider ? `?provider=${provider}` : "";
    api
      .get<ThreadDetail>(`/threads/${threadId}${qs}`)
      .then((data) => setThread(data))
      .catch((err) => {
        setError(err instanceof Error ? err : new Error("Unknown error"));
        setThread(null);
      })
      .finally(() => setIsLoading(false));
  }, [threadId, getToken, provider]);

  return { thread, isLoading, error };
}
