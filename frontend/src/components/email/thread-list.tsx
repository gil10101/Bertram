"use client";

import type { ThreadSummary } from "@/types/email";
import { ThreadListItem } from "./thread-list-item";

function LoadingState() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
      <p className="text-sm">No conversations yet</p>
    </div>
  );
}

interface ThreadListProps {
  threads: ThreadSummary[];
  isLoading: boolean;
  provider?: string;
}

export function ThreadList({ threads, isLoading, provider }: ThreadListProps) {
  if (isLoading) return <LoadingState />;
  if (threads.length === 0) return <EmptyState />;

  return (
    <div className="divide-y divide-border rounded-lg border border-border bg-card">
      {threads.map((thread) => (
        <ThreadListItem key={thread.id} thread={thread} provider={provider} />
      ))}
    </div>
  );
}
