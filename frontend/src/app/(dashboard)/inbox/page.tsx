"use client";

import { useMemo, useState } from "react";
import { useEmails } from "@/hooks/use-emails";
import { useThreads } from "@/hooks/use-threads";
import { useConnectedProviders } from "@/hooks/use-connected-providers";
import { useSearch } from "@/components/common/search-provider";
import { useEmailSync } from "@/components/common/email-sync-provider";
import { EmailList } from "@/components/email/email-list";
import { EmailToolbar } from "@/components/email/email-toolbar";
import { NewEmailBanner } from "@/components/email/new-email-banner";

export default function InboxPage() {
  const { providers } = useConnectedProviders();
  const { query: searchQuery } = useSearch();
  const [activeProvider, setActiveProvider] = useState<string>("all");
  const { newEmailCount, newEmails, dismiss } = useEmailSync();

  const providerForQuery =
    activeProvider === "all" ? undefined : activeProvider;

  const { emails, isLoading, refetch } = useEmails(providerForQuery, searchQuery);
  const { threads } = useThreads(providerForQuery);

  const threadCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const t of threads) {
      map.set(t.id, t.message_count);
    }
    return map;
  }, [threads]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold md:text-2xl">
          {searchQuery ? `Results for "${searchQuery}"` : "Inbox"}
        </h1>
      </div>
      <EmailToolbar
        onRefresh={refetch}
        connectedProviders={providers}
        activeProvider={activeProvider}
        onProviderChange={setActiveProvider}
      />
      {newEmailCount > 0 && (
        <NewEmailBanner
          count={newEmailCount}
          emails={newEmails}
          onDismiss={dismiss}
        />
      )}
      <EmailList
        emails={emails}
        isLoading={isLoading}
        isSearch={!!searchQuery}
        threadCounts={threadCounts}
      />
    </div>
  );
}
