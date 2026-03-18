"use client";

import { Inbox, SearchX } from "lucide-react";
import type { Email } from "@/hooks/use-emails";
import { EmailListItem } from "./email-list-item";
import { EmailRowSkeleton } from "./email-row-skeleton";

function LoadingState() {
  return (
    <div>
      {Array.from({ length: 6 }, (_, i) => (
        <EmailRowSkeleton key={i} delay={i} variant={i % 3} />
      ))}
    </div>
  );
}

function EmptyState({ isSearch }: { isSearch: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {isSearch ? (
        <>
          <SearchX className="mb-3 h-10 w-10 text-muted-foreground/30" />
          <p className="text-sm font-medium text-foreground">No results found</p>
          <p className="mt-1 text-xs text-muted-foreground">Try a different search term</p>
        </>
      ) : (
        <>
          <Inbox className="mb-3 h-10 w-10 text-muted-foreground/30" />
          <p className="text-sm font-medium text-foreground">You&apos;re all caught up</p>
          <p className="mt-1 text-xs text-muted-foreground">No emails in this view</p>
        </>
      )}
    </div>
  );
}

interface EmailListProps {
  emails: Email[];
  isLoading: boolean;
  isSearch?: boolean;
  threadCounts?: Map<string, number>;
  selectMode?: boolean;
  selectedIds?: Set<string>;
  onToggleSelect?: (emailId: string) => void;
  activeEmailId?: string;
  activeThreadId?: string;
  focusedEmailId?: string;
  onSelectEmail?: (email: Email) => void;
  onToggleStar?: (emailId: string, isStarred: boolean) => void;
}

export function EmailList({ emails, isLoading, isSearch = false, threadCounts, selectMode, selectedIds, onToggleSelect, activeEmailId, activeThreadId, focusedEmailId, onSelectEmail, onToggleStar }: EmailListProps) {
  if (isLoading) return <LoadingState />;
  if (emails.length === 0) return <EmptyState isSearch={isSearch} />;

  return (
    <div className="divide-y divide-border rounded-lg border border-border bg-card">
      {emails.map((email, i) => (
        <EmailListItem
          key={email.id}
          email={email}
          index={i}
          threadMessageCount={email.thread_id ? threadCounts?.get(email.thread_id) : undefined}
          selectMode={selectMode}
          isSelected={selectedIds?.has(email.id) ?? false}
          onToggleSelect={onToggleSelect}
          isActive={
            email.thread_id
              ? activeThreadId === email.thread_id
              : activeEmailId === email.id
          }
          isFocused={focusedEmailId === email.id}
          onSelect={onSelectEmail}
          onToggleStar={onToggleStar}
        />
      ))}
    </div>
  );
}
