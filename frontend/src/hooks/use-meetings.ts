"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { createApiClient } from "@/lib/api-client";
import type { Meeting, MeetingCreateRequest, MeetingUpdateRequest } from "@/types/meeting";

export type { Meeting };

export interface UseMeetingsResult {
  meetings: Meeting[];
  isLoading: boolean;
  error: Error | null;
  createMeeting: (data: MeetingCreateRequest) => Promise<void>;
  updateMeeting: (id: string, data: MeetingUpdateRequest) => Promise<void>;
  deleteMeeting: (id: string) => Promise<void>;
  refetch: () => void;
}

export function useMeetings(start?: string, end?: string): UseMeetingsResult {
  const { getToken } = useAuth();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const [refetchTrigger, setRefetchTrigger] = useState(0);
  const refetch = () => setRefetchTrigger((n) => n + 1);

  useEffect(() => {
    setIsLoading(true);
    const api = createApiClient(getToken);
    const params = new URLSearchParams();
    if (start) params.set("start", start);
    if (end) params.set("end", end);
    const qs = params.toString();
    const url = `/calendar/events${qs ? `?${qs}` : ""}`;
    api
      .get<Meeting[]>(url)
      .then((data) => setMeetings(data ?? []))
      .catch((err) => {
        setError(err instanceof Error ? err : new Error("Unknown error"));
        setMeetings([]);
      })
      .finally(() => setIsLoading(false));
  }, [refetchTrigger, getToken, start, end]);

  const createMeeting = useCallback(
    async (data: MeetingCreateRequest) => {
      const api = createApiClient(getToken);
      await api.post("/calendar/events", data);
      refetch();
    },
    [getToken],
  );

  const updateMeeting = useCallback(
    async (id: string, data: MeetingUpdateRequest) => {
      const api = createApiClient(getToken);
      await api.patch(`/calendar/events/${id}`, data);
      refetch();
    },
    [getToken],
  );

  const deleteMeeting = useCallback(
    async (id: string) => {
      const api = createApiClient(getToken);
      await api.delete(`/calendar/events/${id}`);
      refetch();
    },
    [getToken],
  );

  return { meetings, isLoading, error, createMeeting, updateMeeting, deleteMeeting, refetch };
}
