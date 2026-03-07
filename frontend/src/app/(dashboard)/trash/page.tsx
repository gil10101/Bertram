"use client";

import { useState } from "react";
import { useEmails } from "@/hooks/use-emails";
import { useConnectedProviders } from "@/hooks/use-connected-providers";
import { EmailList } from "@/components/email/email-list";
import { EmailToolbar } from "@/components/email/email-toolbar";

export default function TrashPage() {
  const { providers } = useConnectedProviders();
  const [activeProvider, setActiveProvider] = useState<string>("all");

  const providerForQuery =
    activeProvider === "all" ? undefined : activeProvider;

  const { emails, isLoading, refetch, page, setPage, hasNextPage } =
    useEmails(providerForQuery, undefined, "trash");

  return (
    <div className="h-full overflow-y-auto p-4 md:p-6">
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Trash</h1>
      </div>
      <EmailToolbar
        onRefresh={refetch}
        connectedProviders={providers}
        activeProvider={activeProvider}
        onProviderChange={setActiveProvider}
        page={page}
        emailCount={emails.length}
        hasNextPage={hasNextPage}
        onPageChange={setPage}
      />
      <EmailList
        emails={emails}
        isLoading={isLoading}
      />
    </div>
    </div>
  );
}
