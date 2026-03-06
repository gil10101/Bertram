"use client";

import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ThreadSummary } from "@/types/email";

interface ThreadListItemProps {
  thread: ThreadSummary;
  provider?: string;
}

function formatDate(iso: string) {
  const now = new Date();
  const d = new Date(iso);
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  }
  if (diffDays < 7) {
    return d.toLocaleDateString([], { weekday: "short" });
  }
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

export function ThreadListItem({ thread, provider }: ThreadListItemProps) {
  const qs = provider ? `?provider=${provider}` : "";

  return (
    <Link
      href={`/thread/${thread.id}${qs}`}
      className="block px-4 py-3 transition-colors hover:bg-accent/50"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">
            {thread.subject || "(No subject)"}
          </p>
          {thread.message_count > 1 && (
            <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
              <MessageSquare className="h-3 w-3" />
              <span>
                {thread.message_count - 1}{" "}
                {thread.message_count - 1 === 1 ? "reply" : "replies"}
              </span>
            </div>
          )}
        </div>
        <div className="shrink-0 text-right">
          {thread.last_message_at && (
            <span className="text-xs text-muted-foreground">
              {formatDate(thread.last_message_at)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
