"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { createApiClient } from "@/lib/api-client";
import type { Draft } from "@/types/email";

export function useDrafts() {
  const { getToken } = useAuth();
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDrafts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const api = createApiClient(getToken);
      const data = await api.get<Draft[]>("/drafts");
      setDrafts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load drafts");
    } finally {
      setIsLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    fetchDrafts();
  }, [fetchDrafts]);

  const deleteDraft = useCallback(
    async (id: string) => {
      const api = createApiClient(getToken);
      await api.delete(`/drafts/${id}`);
      setDrafts((prev) => prev.filter((d) => d.id !== id));
    },
    [getToken],
  );

  return { drafts, isLoading, error, refetch: fetchDrafts, deleteDraft };
}
