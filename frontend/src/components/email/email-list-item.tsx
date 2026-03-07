"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { AiPriorityBadge } from "@/components/ai/ai-priority-badge";
import type { Email } from "@/hooks/use-emails";

interface EmailListItemProps {
  email: Email;
  threadMessageCount?: number;
  selectMode?: boolean;
  isSelected?: boolean;
  onToggleSelect?: (emailId: string) => void;
  isActive?: boolean;
  onSelect?: (email: Email) => void;
}

export function EmailListItem({ email, threadMessageCount, selectMode, isSelected, onToggleSelect, isActive, onSelect }: EmailListItemProps) {
  const href = email.thread_id
    ? `/thread/${email.thread_id}${email.provider ? `?provider=${email.provider}` : ""}`
    : `/email/${email.id}${email.provider ? `?provider=${email.provider}` : ""}`;

  const inner = (
    <div className="flex items-start justify-between gap-4">
      <div className="flex min-w-0 flex-1 items-start gap-3">
        {/* Sender avatar */}
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-medium text-accent-foreground">
          {(email.sender.name || email.sender.email).charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {/* Unread dot */}
            {!email.is_read && (
              <span className="h-2 w-2 shrink-0 rounded-full bg-paprika" />
            )}
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
  );

  return (
    <div
      className={cn(
        "flex items-center border-l-[3px] border-l-transparent transition-colors hover:bg-accent/50",
        isActive
          ? "bg-accent border-l-primary"
          : isSelected
            ? "bg-accent/40"
            : email.is_read
              ? "bg-muted/30 opacity-70"
              : "bg-card",
      )}
    >
      {/* Checkbox with animated width */}
      <div
        className={cn(
          "flex shrink-0 items-center justify-center overflow-hidden transition-all duration-200 ease-in-out",
          selectMode ? "w-10 pl-3 opacity-100" : "w-0 opacity-0",
        )}
      >
        <input
          type="checkbox"
          checked={isSelected ?? false}
          onChange={() => onToggleSelect?.(email.id)}
          className="h-4 w-4 cursor-pointer rounded border-gray-300"
        />
      </div>
      {onSelect ? (
        <button
          type="button"
          onClick={() => onSelect(email)}
          className="block min-w-0 flex-1 px-4 py-3 text-left"
        >
          {inner}
        </button>
      ) : (
        <Link
          href={href}
          className="block min-w-0 flex-1 px-4 py-3"
        >
          {inner}
        </Link>
      )}
    </div>
  );
}
