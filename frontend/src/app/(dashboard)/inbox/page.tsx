"use client";

import { useState, useCallback, Suspense } from "react";
import { useEmails } from "@/hooks/use-emails";
import { useConnectedProviders } from "@/hooks/use-connected-providers";
import { useSearch } from "@/components/common/search-provider";
import { useEmailSync } from "@/components/common/email-sync-provider";
import { useCompose } from "@/components/common/compose-provider";
import { useMediaQuery } from "@/hooks/use-media-query";
import { EmailList } from "@/components/email/email-list";
import { EmailToolbar } from "@/components/email/email-toolbar";
import { EmailDetail } from "@/components/email/email-detail";
import { ThreadDetail } from "@/components/email/thread-detail";
import { EmailCompose } from "@/components/email/email-compose";
import { NewEmailBanner } from "@/components/email/new-email-banner";
import { cn } from "@/lib/utils";
import type { Email } from "@/hooks/use-emails";

interface SelectedEmail {
  id: string;
  threadId?: string;
  provider?: string;
}

export default function InboxPage() {
  const { providers } = useConnectedProviders();
  const { query: searchQuery } = useSearch();
  const [activeProvider, setActiveProvider] = useState<string>("all");
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectedEmail, setSelectedEmail] = useState<SelectedEmail | null>(null);
  const { newEmailCount, newEmails, dismiss } = useEmailSync();
  const { isComposeOpen, composeData, closeCompose } = useCompose();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const providerForQuery =
    activeProvider === "all" ? undefined : activeProvider;

  const { emails, isLoading, refetch, updateEmails, removeEmails, page, setPage, hasNextPage } =
    useEmails(providerForQuery, searchQuery);

  const toggleSelectMode = useCallback(() => {
    setSelectMode((prev) => !prev);
    setSelectedIds(new Set());
  }, []);

  const toggleSelect = useCallback((emailId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(emailId)) next.delete(emailId);
      else next.add(emailId);
      return next;
    });
  }, []);

  const handleMarkRead = useCallback(async () => {
    if (selectedIds.size === 0) return;
    await updateEmails([...selectedIds], { is_read: true });
    setSelectedIds(new Set());
    setSelectMode(false);
  }, [selectedIds, updateEmails]);

  const handleArchive = useCallback(async () => {
    if (selectedIds.size === 0) return;
    try {
      await removeEmails([...selectedIds], { archive: true });
      setSelectedIds(new Set());
      setSelectMode(false);
    } catch {
      // Rollback handled by removeEmails; selection preserved so user can retry
    }
  }, [selectedIds, removeEmails]);

  const handleDelete = useCallback(async () => {
    if (selectedIds.size === 0) return;
    try {
      await removeEmails([...selectedIds], { trash: true });
      setSelectedIds(new Set());
      setSelectMode(false);
    } catch {
      // Rollback handled by removeEmails; selection preserved so user can retry
    }
  }, [selectedIds, removeEmails]);

  const handleSelectEmail = useCallback((email: Email) => {
    closeCompose();
    setSelectedEmail({
      id: email.id,
      threadId: email.thread_id,
      provider: email.provider,
    });
  }, [closeCompose]);

  const handleCloseDetail = useCallback(() => {
    setSelectedEmail(null);
  }, []);

  const handleActionComplete = useCallback(() => {
    setSelectedEmail(null);
    refetch();
  }, [refetch]);

  const handleComposeSent = useCallback(() => {
    closeCompose();
    refetch();
  }, [closeCompose, refetch]);

  const showRightPanel = selectedEmail !== null || isComposeOpen;

  // Desktop: split-pane layout with animated panels
  if (isDesktop) {
    return (
      <div className="flex h-full">
        {/* Left panel: email list */}
        <div
          className={cn(
            "flex h-full shrink-0 flex-col overflow-hidden transition-all duration-300 ease-in-out",
            showRightPanel ? "w-[400px] border-r border-border" : "w-full"
          )}
        >
          {/* Sticky header */}
          <div className="flex shrink-0 flex-col gap-4 p-4">
            {searchQuery && (
              <p className="text-sm text-muted-foreground">
                Results for &quot;{searchQuery}&quot;
              </p>
            )}
            <EmailToolbar
              onRefresh={refetch}
              onMarkRead={handleMarkRead}
              onArchive={handleArchive}
              onDelete={handleDelete}
              connectedProviders={providers}
              activeProvider={activeProvider}
              onProviderChange={setActiveProvider}
              page={page}
              emailCount={emails.length}
              hasNextPage={hasNextPage}
              onPageChange={setPage}
              selectMode={selectMode}
              onToggleSelectMode={toggleSelectMode}
              selectedCount={selectedIds.size}
            />
            {newEmailCount > 0 && (
              <NewEmailBanner
                count={newEmailCount}
                emails={newEmails}
                onDismiss={dismiss}
              />
            )}
          </div>
          {/* Scrollable list */}
          <div className="flex-1 overflow-y-auto px-4 pb-4">
            <EmailList
              emails={emails}
              isLoading={isLoading}
              isSearch={!!searchQuery}
              selectMode={selectMode}
              selectedIds={selectedIds}
              onToggleSelect={toggleSelect}
              activeEmailId={selectedEmail?.id}
              activeThreadId={selectedEmail?.threadId}
              onSelectEmail={handleSelectEmail}
            />
          </div>
        </div>

        {/* Right panel: email detail or compose */}
        <div
          className={cn(
            "overflow-hidden transition-all duration-300 ease-in-out",
            showRightPanel ? "flex-1 opacity-100" : "w-0 flex-none opacity-0"
          )}
        >
          <div className="h-full overflow-y-auto p-6">
            {isComposeOpen ? (
              <Suspense fallback={null}>
                <EmailCompose
                  embedded
                  initialData={composeData ?? undefined}
                  onClose={closeCompose}
                  onSent={handleComposeSent}
                />
              </Suspense>
            ) : selectedEmail ? (
              selectedEmail.threadId ? (
                <ThreadDetail
                  key={selectedEmail.threadId}
                  threadId={selectedEmail.threadId}
                  provider={selectedEmail.provider}
                  embedded
                  onClose={handleCloseDetail}
                  onActionComplete={handleActionComplete}
                />
              ) : (
                <EmailDetail
                  key={selectedEmail.id}
                  emailId={selectedEmail.id}
                  provider={selectedEmail.provider}
                  embedded
                  onClose={handleCloseDetail}
                  onActionComplete={handleActionComplete}
                />
              )
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  // Mobile: single-column layout (navigates via Link)
  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="flex flex-col gap-4">
        {searchQuery && (
          <p className="text-sm text-muted-foreground">
            Results for &quot;{searchQuery}&quot;
          </p>
        )}
        <EmailToolbar
          onRefresh={refetch}
          onMarkRead={handleMarkRead}
          onArchive={handleArchive}
          onDelete={handleDelete}
          connectedProviders={providers}
          activeProvider={activeProvider}
          onProviderChange={setActiveProvider}
          page={page}
          emailCount={emails.length}
          hasNextPage={hasNextPage}
          onPageChange={setPage}
          selectMode={selectMode}
          onToggleSelectMode={toggleSelectMode}
          selectedCount={selectedIds.size}
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
          selectMode={selectMode}
          selectedIds={selectedIds}
          onToggleSelect={toggleSelect}
        />
      </div>
    </div>
  );
}
