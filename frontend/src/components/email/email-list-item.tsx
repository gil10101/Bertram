"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { AiPriorityBadge } from "@/components/ai/ai-priority-badge";
import type { Email } from "@/hooks/use-emails";

interface EmailListItemProps {
  email: Email;
  threadMessageCount?: number;
}

export function EmailListItem({ email, threadMessageCount }: EmailListItemProps) {
  const href = email.thread_id
    ? `/thread/${email.thread_id}${email.provider ? `?provider=${email.provider}` : ""}`
    : `/email/${email.id}${email.provider ? `?provider=${email.provider}` : ""}`;

  return (
    <Link
      href={href}
      className={cn(
        "block border-b border-border px-4 py-3 transition-colors hover:bg-accent/50",
        email.is_read ? "bg-muted/30 opacity-70" : "bg-card",
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "truncate text-sm",
                email.is_read ? "text-muted-foreground/70" : "font-semibold text-foreground",
              )}
            >
              {email.sender.name || email.sender.email}
            </span>
            {email.priority && <AiPriorityBadge priority={email.priority} />}
          </div>
          <div className="flex items-center gap-1.5">
            <p
              className={cn(
                "truncate text-sm",
                email.is_read ? "text-muted-foreground" : "font-semibold text-foreground",
              )}
            >
              {email.subject || "(No subject)"}
            </p>
            {threadMessageCount != null && threadMessageCount > 1 && (
              <span
                className={cn(
                  "shrink-0 text-xs",
                  email.is_read ? "text-muted-foreground/60" : "text-muted-foreground",
                )}
              >
                ({threadMessageCount})
              </span>
            )}
          </div>
          <p
            className={cn(
              "truncate text-xs",
              email.is_read ? "text-muted-foreground/60" : "text-muted-foreground",
            )}
          >
            {email.snippet}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <span
            className={cn(
              "block text-xs",
              email.is_read ? "text-muted-foreground/60" : "text-muted-foreground",
            )}
          >
            {new Date(email.received_at).toLocaleDateString()}
          </span>
          <span
            className={cn(
              "block text-[11px]",
              email.is_read ? "text-muted-foreground/35" : "text-muted-foreground/50",
            )}
          >
            {new Date(email.received_at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
          </span>
        </div>
      </div>
    </Link>
  );
}
