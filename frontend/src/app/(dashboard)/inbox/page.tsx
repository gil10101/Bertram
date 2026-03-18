"use client";

import { useState, useCallback, useMemo, useEffect, useRef, Suspense } from "react";
import { useAuth } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { useEmails } from "@/hooks/use-emails";
import { useDrafts } from "@/hooks/use-drafts";
import { useSearch } from "@/components/common/search-provider";
import { useEmailSync } from "@/components/common/email-sync-provider";
import { useCompose } from "@/components/common/compose-provider";
import { useMediaQuery } from "@/hooks/use-media-query";
import { createApiClient } from "@/lib/api-client";
import { MailSidebar } from "@/components/mail/mail-sidebar";
import { MailList } from "@/components/mail/mail-list";
import { ThreadDisplay } from "@/components/mail/thread-display";
import { EmptyThreadDisplay } from "@/components/mail/empty-thread-display";
import { EmailCompose } from "@/components/email/email-compose";
import { MailListHotkeys } from "@/components/shortcuts/mail-list-hotkeys";
import type { GmailCategory } from "@/components/email/gmail-category-tabs";
import type { Email } from "@/hooks/use-emails";
import type { Draft } from "@/types/email";

interface SelectedEmail {
  id: string;
  threadId?: string;
  provider?: string;
}

const FOLDER_TITLES: Record<string, string> = {
  SENT: "Sent",
  SPAM: "Spam",
  TRASH: "Bin",
  archive: "Archive",
};

function draftToEmail(draft: Draft): Email {
  return {
    id: draft.id,
    subject: draft.subject || "(no subject)",
    sender: {
      name: draft.to.length > 0 ? draft.to.join(", ") : "(no recipients)",
      email: draft.to[0] || "",
    },
    snippet: draft.body ? draft.body.replace(/<[^>]+>/g, "").slice(0, 100) : "",
    is_read: true,
    is_starred: false,
    received_at: draft.updated_at,
    labels: [],
  };
}

function InboxContent() {
  const { getToken } = useAuth();
  const searchParams = useSearchParams();
  const { query: searchQuery } = useSearch();
  const { newEmailCount, newEmails, dismiss } = useEmailSync();
  const { isComposeOpen, composeData, closeCompose } = useCompose();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  // Derive folder/view from URL params
  const folder = searchParams.get("folder") ?? undefined;
  const view = searchParams.get("view") ?? undefined;
  const isDraftsView = view === "drafts";

  // Determine title from folder/view
  const title = isDraftsView
    ? "Drafts"
    : view === "starred"
      ? "Favorites"
      : folder
        ? FOLDER_TITLES[folder] ?? "Inbox"
        : "Inbox";

  const activeProvider = searchParams.get("provider") ?? "all";
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectedEmail, setSelectedEmail] = useState<SelectedEmail | null>(null);
  const [focusedEmailId, setFocusedEmailId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<GmailCategory>("primary");
  const [isPrioritizing, setIsPrioritizing] = useState(false);
  const [priorityOverrides, setPriorityOverrides] = useState<Map<string, "high" | "medium" | "low">>(new Map());

  // Reset Gmail category when switching away from Gmail
  useEffect(() => {
    if (activeProvider !== "gmail") {
      setActiveCategory("primary");
    }
  }, [activeProvider]);

  const providerForQuery =
    activeProvider === "all" ? undefined : activeProvider;
  const isGmailActive = activeProvider === "gmail";
  const categoryForQuery = isGmailActive ? activeCategory : undefined;

  // For starred view, we pass starred filter
  const folderForQuery = view === "starred" || isDraftsView ? undefined : folder;

  const { emails: rawEmails, isLoading, refetch, updateEmails, removeEmails, page, setPage, hasNextPage } =
    useEmails(providerForQuery, searchQuery, folderForQuery, categoryForQuery);

  // Fetch up to 5 most recent starred emails for the pinned section (page 1 only)
  const [pinnedEmails, setPinnedEmails] = useState<Email[]>([]);
  const pinnedFetchedRef = useRef(false);

  useEffect(() => {
    if (page !== 1 || isDraftsView || view === "starred" || searchQuery || folder) {
      setPinnedEmails([]);
      return;
    }
    let cancelled = false;
    const fetchPinned = async () => {
      try {
        const api = createApiClient(getToken);
        const params = new URLSearchParams();
        if (providerForQuery) params.set("provider", providerForQuery);
        params.set("folder", "starred");
        params.set("page", "1");
        params.set("per_page", "5");
        const res = await api.get<Email[]>(`/emails?${params.toString()}`);
        if (!cancelled) setPinnedEmails(res ?? []);
      } catch {
        if (!cancelled) setPinnedEmails([]);
      }
    };
    fetchPinned();
    pinnedFetchedRef.current = true;
    return () => { cancelled = true; };
  }, [page, isDraftsView, view, searchQuery, folder, getToken, providerForQuery]);

  // Drafts data
  const { drafts, isLoading: draftsLoading, refetch: refetchDrafts } = useDrafts();

  const draftEmails = useMemo(
    () => (isDraftsView ? drafts.map(draftToEmail) : []),
    [isDraftsView, drafts]
  );

  // Filter starred emails client-side for "Favorites" view
  const filteredEmails = isDraftsView
    ? draftEmails
    : view === "starred"
      ? rawEmails.filter((e) => e.is_starred)
      : rawEmails;

  // Merge AI priority overrides
  const emails = !isDraftsView && priorityOverrides.size > 0
    ? filteredEmails.map((e) => {
        const p = priorityOverrides.get(e.id);
        return p ? { ...e, priority: p } : e;
      })
    : filteredEmails;

  const displayLoading = isDraftsView ? draftsLoading : isLoading;

  // Find full draft data for selected draft
  const selectedDraft = isDraftsView && selectedEmail
    ? drafts.find((d) => d.id === selectedEmail.id) ?? null
    : null;

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
    } catch { /* handled */ }
  }, [selectedIds, removeEmails]);

  const handleDelete = useCallback(async () => {
    if (selectedIds.size === 0) return;
    try {
      await removeEmails([...selectedIds], { trash: true });
      setSelectedIds(new Set());
      setSelectMode(false);
    } catch { /* handled */ }
  }, [selectedIds, removeEmails]);

  const handleToggleStar = useCallback(async (emailId: string, isStarred: boolean) => {
    if (isDraftsView) return;
    await updateEmails([emailId], { is_starred: isStarred });
  }, [updateEmails, isDraftsView]);

  const handleSelectEmail = useCallback((email: Email) => {
    closeCompose();
    setSelectedEmail({
      id: email.id,
      threadId: isDraftsView ? undefined : email.thread_id,
      provider: isDraftsView ? undefined : email.provider,
    });
  }, [closeCompose, isDraftsView]);

  const handleCloseDetail = useCallback(() => {
    setSelectedEmail(null);
    if (isDraftsView) refetchDrafts();
  }, [isDraftsView, refetchDrafts]);

  const handleActionComplete = useCallback(() => {
    setSelectedEmail(null);
    refetch();
  }, [refetch]);

  const handleDraftSent = useCallback(() => {
    setSelectedEmail(null);
    refetchDrafts();
  }, [refetchDrafts]);

  const handleAiPrioritize = useCallback(async () => {
    if (emails.length === 0 || isPrioritizing) return;
    setIsPrioritizing(true);
    try {
      const api = createApiClient(getToken);
      const res = await api.post<{ priorities: { id: string; priority: "high" | "medium" | "low" }[] }>(
        "/ai/prioritize"
      );
      const priorityMap = new Map(
        (res.priorities ?? []).map((p) => [p.id, p.priority])
      );
      setPriorityOverrides(priorityMap);
    } catch { /* silently fail */ } finally {
      setIsPrioritizing(false);
    }
  }, [emails.length, isPrioritizing, getToken]);


  const handleComposeSent = useCallback(() => {
    closeCompose();
    refetch();
  }, [closeCompose, refetch]);

  const handleSelectAll = useCallback(() => {
    if (!selectMode) setSelectMode(true);
    setSelectedIds(new Set(emails.map((e) => e.id)));
  }, [selectMode, emails]);

  const handleExitSelectMode = useCallback(() => {
    setSelectMode(false);
    setSelectedIds(new Set());
  }, []);

  const handleMarkUnread = useCallback(async () => {
    if (selectedIds.size === 0) return;
    await updateEmails([...selectedIds], { is_read: false });
    setSelectedIds(new Set());
    setSelectMode(false);
  }, [selectedIds, updateEmails]);

  // Navigate to prev/next email in list
  const handlePrevEmail = useCallback(() => {
    if (!selectedEmail) return;
    const idx = emails.findIndex((e) => e.id === selectedEmail.id);
    if (idx > 0) {
      const prev = emails[idx - 1];
      setSelectedEmail({ id: prev.id, threadId: prev.thread_id, provider: prev.provider });
    }
  }, [selectedEmail, emails]);

  const handleNextEmail = useCallback(() => {
    if (!selectedEmail) return;
    const idx = emails.findIndex((e) => e.id === selectedEmail.id);
    if (idx < emails.length - 1) {
      const next = emails[idx + 1];
      setSelectedEmail({ id: next.id, threadId: next.thread_id, provider: next.provider });
    }
  }, [selectedEmail, emails]);

  // Thread display keyboard shortcuts (R/A/F/E/Esc) are now registered
  // directly inside ThreadDisplay, which owns the reply mode state.

  // Shared MailList props
  const mailListProps = {
    title,
    emails,
    pinnedEmails: page === 1 && !isDraftsView && view !== "starred" && !searchQuery && !folder ? pinnedEmails : [],
    isLoading: displayLoading,
    onSelectEmail: handleSelectEmail,
    onToggleStar: handleToggleStar,
    selectMode: isDraftsView ? false : selectMode,
    selectedIds,
    onToggleSelectMode: toggleSelectMode,
    onToggleSelect: toggleSelect,
    onMarkRead: isDraftsView ? undefined : handleMarkRead,
    onArchive: isDraftsView ? undefined : handleArchive,
    onDelete: isDraftsView ? undefined : handleDelete,
    selectedCount: selectedIds.size,
    page: isDraftsView ? 1 : page,
    hasNextPage: isDraftsView ? false : hasNextPage,
    onPageChange: setPage,
    emailCount: emails.length,
    isGmailActive: isDraftsView ? false : isGmailActive,
    activeCategory,
    onCategoryChange: setActiveCategory,
    onAiPrioritize: isDraftsView ? undefined : handleAiPrioritize,
    isPrioritizing,
    newEmailCount: isDraftsView ? 0 : newEmailCount,
    newEmails: isDraftsView ? undefined : newEmails,
    onDismissNewEmails: isDraftsView ? undefined : dismiss,
    searchQuery,
  } as const;

  // Right pane content helper
  const renderDetailPane = (showNav: boolean) => {
    if (isComposeOpen) {
      return (
        <div className="h-full overflow-y-auto p-6">
          <Suspense fallback={null}>
            <EmailCompose
              embedded
              initialData={composeData ?? undefined}
              onClose={closeCompose}
              onSent={handleComposeSent}
            />
          </Suspense>
        </div>
      );
    }

    if (selectedDraft) {
      return (
        <div className="h-full overflow-y-auto p-6">
          <Suspense fallback={null}>
            <EmailCompose
              key={selectedDraft.id}
              embedded
              initialDraftId={selectedDraft.id}
              initialData={{
                mode: selectedDraft.mode || "new",
                to: selectedDraft.to.join(", "),
                cc: selectedDraft.cc.join(", "),
                subject: selectedDraft.subject,
                body: selectedDraft.body,
                thread_id: selectedDraft.thread_id ?? undefined,
                in_reply_to: selectedDraft.in_reply_to ?? undefined,
                references: selectedDraft.references ?? undefined,
              }}
              onClose={handleCloseDetail}
              onSent={handleDraftSent}
            />
          </Suspense>
        </div>
      );
    }

    if (selectedEmail) {
      return (
        <ThreadDisplay
          key={selectedEmail.threadId ?? selectedEmail.id}
          emailId={selectedEmail.id}
          threadId={selectedEmail.threadId}
          provider={selectedEmail.provider}
          onClose={handleCloseDetail}
          onPrev={showNav ? handlePrevEmail : undefined}
          onNext={showNav ? handleNextEmail : undefined}
          onActionComplete={handleActionComplete}
          onToggleStar={handleToggleStar}
          removeEmails={removeEmails}
        />
      );
    }

    return <EmptyThreadDisplay />;
  };

  // Desktop three-pane layout
  if (isDesktop) {
    return (
      <div className="dark flex h-screen w-full overflow-hidden bg-sidebar">
        {!isDraftsView && (
          <>
            <MailListHotkeys
              emails={emails}
              onSelectEmail={handleSelectEmail}
              onToggleStar={handleToggleStar}
              onArchive={handleArchive}
              onDelete={handleDelete}
              onMarkRead={handleMarkRead}
              onMarkUnread={handleMarkUnread}
              onToggleSelect={toggleSelect}
              onSelectAll={handleSelectAll}
              onExitSelectMode={handleExitSelectMode}
              onAiPrioritize={handleAiPrioritize}
              updateEmails={updateEmails}
              selectMode={selectMode}
              enabled={!selectedEmail && !isComposeOpen}
              onFocusedEmailChange={setFocusedEmailId}
            />
          </>
        )}

        <MailSidebar />

        <div className="flex flex-1 min-w-0 gap-[2px] pr-1.5 py-1.5 pl-0">
          {/* Mail List pane */}
          <div className="w-[340px] flex-shrink-0">
            <div className="h-full overflow-hidden rounded-xl bg-background">
              <MailList
                {...mailListProps}
                selectedEmailId={selectedEmail?.threadId ?? selectedEmail?.id}
                focusedEmailId={focusedEmailId ?? undefined}
              />
            </div>
          </div>

          {/* Detail pane */}
          <div className="flex-1 min-w-0">
            <div className="h-full overflow-hidden rounded-xl bg-background">
              {renderDetailPane(true)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Mobile: single-pane at a time
  if (selectedEmail && !isComposeOpen) {
    if (selectedDraft) {
      return (
        <div className="dark flex h-screen w-full overflow-hidden bg-background p-4">
          <Suspense fallback={null}>
            <EmailCompose
              key={selectedDraft.id}
              embedded
              initialDraftId={selectedDraft.id}
              initialData={{
                mode: selectedDraft.mode || "new",
                to: selectedDraft.to.join(", "),
                cc: selectedDraft.cc.join(", "),
                subject: selectedDraft.subject,
                body: selectedDraft.body,
                thread_id: selectedDraft.thread_id ?? undefined,
                in_reply_to: selectedDraft.in_reply_to ?? undefined,
                references: selectedDraft.references ?? undefined,
              }}
              onClose={handleCloseDetail}
              onSent={handleDraftSent}
            />
          </Suspense>
        </div>
      );
    }

    return (
      <div className="dark flex h-screen w-full overflow-hidden bg-background">
        <ThreadDisplay
          key={selectedEmail.threadId ?? selectedEmail.id}
          emailId={selectedEmail.id}
          threadId={selectedEmail.threadId}
          provider={selectedEmail.provider}
          onClose={handleCloseDetail}
          onActionComplete={handleActionComplete}
          onToggleStar={handleToggleStar}
          removeEmails={removeEmails}
        />
      </div>
    );
  }

  return (
    <div className="dark flex h-screen w-full overflow-hidden bg-sidebar">
      <MailSidebar />
      <div className="flex flex-1 min-w-0 p-1 pl-0">
        <div className="flex-1 min-w-0">
          <div className="h-full overflow-hidden rounded-xl bg-background">
            <MailList
              {...mailListProps}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function InboxPage() {
  return (
    <Suspense>
      <InboxContent />
    </Suspense>
  );
}
