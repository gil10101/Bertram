"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { createApiClient } from "@/lib/api-client";

export function useConnectedProviders() {
  const { getToken } = useAuth();
  const [providers, setProviders] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refetch = useCallback(async () => {
    try {
      const api = createApiClient(getToken);
      const data = await api.get<{ connected_providers: string[] }>("/auth/status");
      setProviders(data.connected_providers ?? []);
    } catch {
      setProviders([]);
    } finally {
      setIsLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { providers, isLoading, refetch };
}
