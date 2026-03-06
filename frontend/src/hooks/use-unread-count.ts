"use client";

import { useEmailSync } from "@/components/common/email-sync-provider";

export function useUnreadCount() {
  const { unreadCount } = useEmailSync();
  return unreadCount;
}
