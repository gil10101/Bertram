"use client";

import { SearchX } from "lucide-react";
import type { Email } from "@/hooks/use-emails";
import { EmailListItem } from "./email-list-item";

function LoadingState() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  );
}

function EmptyState({ isSearch }: { isSearch: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
      {isSearch ? (
        <>
          <SearchX className="mb-2 h-8 w-8" />
          <p className="text-sm">No emails match your search</p>
        </>
      ) : (
        <p className="text-sm">No emails yet</p>
      )}
    </div>
  );
}

interface EmailListProps {
  emails: Email[];
  isLoading: boolean;
  isSearch?: boolean;
  threadCounts?: Map<string, number>;
}

export function EmailList({ emails, isLoading, isSearch = false, threadCounts }: EmailListProps) {
  if (isLoading) return <LoadingState />;
  if (emails.length === 0) return <EmptyState isSearch={isSearch} />;

  return (
    <div className="divide-y divide-border rounded-lg border border-border bg-card">
      {emails.map((email) => (
        <EmailListItem
          key={email.id}
          email={email}
          threadMessageCount={email.thread_id ? threadCounts?.get(email.thread_id) : undefined}
        />
      ))}
    </div>
  );
}
