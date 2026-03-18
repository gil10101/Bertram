"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Check,
  ChevronLeft,
  ChevronRight,
  Mail,
  Archive,
  Trash2,
  Loader2,
  SearchX,
  Star as StarIcon,
  Tag,
  Users,
  Bell,
  MessageSquare,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { isMac } from "@/lib/platform";
import { getAvatarColor, getInitial, formatEmailDate } from "@/lib/email-utils";
import { useSearch } from "@/components/common/search-provider";
import { useDebounce } from "@/hooks/use-debounce";
import { AiPriorityBadge } from "@/components/ai/ai-priority-badge";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { GmailCategoryTabs } from "@/components/email/gmail-category-tabs";
import { NewEmailBanner } from "@/components/email/new-email-banner";
import type { GmailCategory } from "@/components/email/gmail-category-tabs";
import { EmailRowSkeleton } from "@/components/email/email-row-skeleton";
import type { Email } from "@/hooks/use-emails";

interface NewEmailPreview {
  id: string;
  subject: string;
  sender: { name: string; email: string };
  snippet: string;
  provider?: string;
}

interface MailListProps {
  title: string;
  emails: Email[];
  pinnedEmails?: Email[];
  isLoading: boolean;
  selectedEmailId?: string;
  onSelectEmail: (email: Email) => void;
  onToggleStar: (emailId: string, isStarred: boolean) => void;
  // Select mode
  selectMode: boolean;
  selectedIds: Set<string>;
  onToggleSelectMode: () => void;
  onToggleSelect: (emailId: string) => void;
  // Batch actions
  onMarkRead?: () => void;
  onArchive?: () => void;
  onDelete?: () => void;
  selectedCount: number;
  // Pagination
  page: number;
  hasNextPage: boolean;
  onPageChange: (page: number) => void;
  emailCount: number;
  // Gmail categories
  isGmailActive?: boolean;
  activeCategory?: GmailCategory;
  onCategoryChange?: (category: GmailCategory) => void;
  // AI Prioritize
  onAiPrioritize?: () => void;
  isPrioritizing?: boolean;
  // New email banner
  newEmailCount?: number;
  newEmails?: NewEmailPreview[];
  onDismissNewEmails?: () => void;
  // Focused email for keyboard nav
  focusedEmailId?: string;
  // Search
  searchQuery?: string;
}

const LABEL_CONFIG: Record<string, { icon: React.ReactNode; label: string }> = {
  important: {
    icon: <Zap className="h-3.5 w-3.5 fill-[#F59E0D] text-[#F59E0D]" />,
    label: "Important",
  },
  promotions: {
    icon: <Tag className="h-3.5 w-3.5 fill-[#F43F5E] text-[#F43F5E]" />,
    label: "Promotions",
  },
  personal: {
    icon: <StarIcon className="h-3.5 w-3.5 fill-[#39AE4A] text-[#39AE4A]" />,
    label: "Personal",
  },
  updates: {
    icon: <Bell className="h-3.5 w-3.5 fill-[#8B5CF6] text-[#8B5CF6]" />,
    label: "Updates",
  },
  social: {
    icon: <Users className="h-3.5 w-3.5 text-[#2563EB]" />,
    label: "Social",
  },
  forums: {
    icon: <MessageSquare className="h-3.5 w-3.5 text-[#0D9488]" />,
    label: "Forums",
  },
  starred: {
    icon: <StarIcon className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />,
    label: "Starred",
  },
};

const HIDDEN_LABELS = new Set(["unread", "inbox", "sent", "draft", "trash", "spam"]);

function CategoryLabels({ labels }: { labels?: string[] }) {
  if (!labels || labels.length === 0) return null;

  const visible: { key: string; config: (typeof LABEL_CONFIG)[string] }[] = [];

  for (const raw of labels) {
    const normalized = raw.toLowerCase().replace(/^category_/i, "");
    if (HIDDEN_LABELS.has(normalized)) continue;
    const config = LABEL_CONFIG[normalized];
    if (config) visible.push({ key: raw, config });
  }

  if (visible.length === 0) return null;

  return (
    <TooltipProvider>
      <div className="flex items-center gap-0.5">
        {visible.map(({ key, config }, i) => (
          <Tooltip key={`${key}-${i}`}>
            <TooltipTrigger asChild>
              <span className="flex items-center">
                {config.icon}
              </span>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p className="text-xs">{config.label}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
}

const PriorityDot = ({ type }: { type: string }) => {
  const colorMap: Record<string, string> = {
    high: "bg-destructive",
    medium: "bg-star",
    low: "bg-green-500",
  };
  return <span className={`inline-block h-2 w-2 rounded-full ${colorMap[type] || "bg-faint"}`} />;
};

function EmailRow({
  email,
  isSelected,
  onClick,
  selectMode,
  isChecked,
  onToggleSelect,
  onToggleStar,
  isFocused,
  threadCount,
  index = 0,
}: {
  email: Email;
  isSelected: boolean;
  onClick: () => void;
  selectMode: boolean;
  isChecked: boolean;
  onToggleSelect: (id: string) => void;
  onToggleStar: (id: string, starred: boolean) => void;
  isFocused: boolean;
  threadCount?: number;
  index?: number;
}) {
  return (
    <button
      onClick={onClick}
      data-email-id={email.id}
      className={cn(
        "animate-fade-slide-up flex w-full items-start gap-3 border-b border-sidebar px-4 py-3 text-left transition-colors duration-150",
        isSelected
          ? "border-l-2 border-l-primary bg-accent"
          : isFocused
            ? "border-l-2 border-l-primary/50 bg-accent/60"
            : "border-l-2 border-l-transparent hover:bg-card"
      )}
      style={{ animationDelay: `${Math.min(index * 30, 300)}ms` }}
    >
      {/* Checkbox (animated) */}
      <div
        className={cn(
          "flex shrink-0 items-center justify-center overflow-hidden transition-all duration-200 ease-in-out",
          selectMode ? "w-5 opacity-100" : "w-0 opacity-0"
        )}
      >
        <input
          type="checkbox"
          checked={isChecked}
          onChange={(e) => {
            e.stopPropagation();
            onToggleSelect(email.id);
          }}
          onClick={(e) => e.stopPropagation()}
          className="h-4 w-4 cursor-pointer rounded border-gray-300"
        />
      </div>

      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <div
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium text-foreground",
            getAvatarColor(email.sender.email)
          )}
        >
          {getInitial(email.sender.name, email.sender.email)}
        </div>
        {!email.is_read && (
          <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-primary" />
        )}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span
            className={cn(
              "truncate text-sm",
              !email.is_read ? "font-bold text-foreground" : "font-medium text-foreground"
            )}
          >
            {email.sender.name || email.sender.email}
          </span>
          {threadCount != null && threadCount > 1 && (
            <span className="shrink-0 text-xs text-muted-foreground">[{threadCount}]</span>
          )}
        </div>
        <p className="truncate text-[13px] text-muted-foreground">
          {email.subject || "(No subject)"}
        </p>
      </div>

      {/* Metadata */}
      <div className="flex flex-shrink-0 flex-col items-end gap-1.5">
        <span className="text-xs text-faint">{formatEmailDate(email.received_at)}</span>
        <div className="flex items-center gap-1">
          {email.priority && <PriorityDot type={email.priority} />}
          {email.is_starred && (
            <span className="h-2 w-2 rounded-full bg-star" />
          )}
        </div>
        <CategoryLabels labels={email.labels} />
      </div>
    </button>
  );
}

export function MailList({
  title,
  emails,
  pinnedEmails: pinnedEmailsProp,
  isLoading,
  selectedEmailId,
  onSelectEmail,
  onToggleStar,
  selectMode,
  selectedIds,
  onToggleSelectMode,
  onToggleSelect,
  onMarkRead,
  onArchive,
  onDelete,
  selectedCount,
  page,
  hasNextPage,
  onPageChange,
  emailCount,
  isGmailActive,
  activeCategory,
  onCategoryChange,
  onAiPrioritize,
  isPrioritizing,
  newEmailCount,
  newEmails,
  onDismissNewEmails,
  focusedEmailId,
  searchQuery,
}: MailListProps) {
  const { setQuery } = useSearch();
  const [searchInput, setSearchInput] = useState(searchQuery || "");
  const debouncedSearch = useDebounce(searchInput, 350);

  useEffect(() => {
    setQuery(debouncedSearch.trim());
  }, [debouncedSearch, setQuery]);

  // Use separately-fetched pinned emails if provided, otherwise fall back to filtering from list
  const pinnedEmails = pinnedEmailsProp ?? emails.filter((e) => e.is_starred);
  const pinnedIds = new Set(pinnedEmails.map((e) => e.id));
  const primaryEmails = emails.filter((e) => !pinnedIds.has(e.id));


  const perPage = 20;
  const rangeStart = (page - 1) * perPage + 1;
  const rangeEnd = (page - 1) * perPage + emailCount;

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-2">
        <h2 className="text-lg font-bold text-foreground">{title}</h2>
        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleSelectMode}
            className={cn(
              "flex items-center gap-1.5 whitespace-nowrap rounded-md px-2.5 py-1.5 text-sm text-muted-foreground hover:bg-card",
              selectMode && "bg-card text-foreground"
            )}
          >
            <Check className="h-4 w-4" />
            {selectMode ? (
              <>
                Cancel
                {selectedCount > 0 && (
                  <span className="ml-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-semibold text-primary-foreground">
                    {selectedCount}
                  </span>
                )}
              </>
            ) : (
              "Select"
            )}
          </button>
        </div>
      </div>

      {/* Batch actions bar */}
      <div
        className={cn(
          "grid overflow-hidden px-4 transition-all duration-200",
          selectMode ? "max-h-12 py-1.5 opacity-100" : "max-h-0 py-0 opacity-0"
        )}
        style={{ gridTemplateColumns: "1fr 1fr auto 1fr" }}
      >
        <button
          type="button"
          className="inline-flex h-7 whitespace-nowrap items-center justify-center gap-1.5 rounded-md border border-border bg-background text-xs font-medium text-muted-foreground hover:bg-card disabled:opacity-50"
          onClick={onMarkRead}
          disabled={selectedCount === 0}
        >
          <Mail className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">Mark Read</span>
        </button>
        {onArchive && (
          <button
            type="button"
            className="inline-flex h-7 whitespace-nowrap items-center justify-center gap-1.5 rounded-md border border-border bg-background text-xs font-medium text-muted-foreground hover:bg-card disabled:opacity-50 ml-1.5"
            onClick={onArchive}
            disabled={selectedCount === 0}
          >
            <Archive className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">Archive</span>
          </button>
        )}
        {onDelete && (
          <button
            type="button"
            className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border bg-background text-xs font-medium text-destructive hover:bg-card disabled:opacity-50 ml-1.5"
            onClick={onDelete}
            disabled={selectedCount === 0}
          >
            <Trash2 className="h-3.5 w-3.5 shrink-0" />
          </button>
        )}
        {onAiPrioritize && (
          <button
            type="button"
            className="inline-flex h-7 whitespace-nowrap items-center justify-center gap-1.5 rounded-md border border-border bg-background text-xs font-medium hover:bg-card disabled:opacity-50 ml-1.5"
            onClick={onAiPrioritize}
            disabled={isPrioritizing}
          >
            {isPrioritizing ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <span className="animate-text-shimmer bg-[length:250%_100%] bg-clip-text text-transparent bg-[linear-gradient(110deg,hsl(var(--foreground))_35%,hsl(var(--primary))_50%,hsl(var(--foreground))_65%)]">
                Prioritize
              </span>
            )}
          </button>
        )}
      </div>

      {/* Search */}
      <div className="px-3 py-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
          <input
            type="text"
            placeholder="Search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full rounded-lg border border-border bg-card py-2 pl-9 pr-12 text-sm text-foreground placeholder:text-faint focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 rounded bg-accent px-1.5 py-0.5 text-[11px] text-faint">
            {isMac ? "\u2318" : "Ctrl+"}K
          </span>
        </div>
      </div>

      {/* Category filters (Gmail only) */}
      {isGmailActive && activeCategory && onCategoryChange && (
        <div className="px-3 pb-2">
          <GmailCategoryTabs
            activeCategory={activeCategory}
            onCategoryChange={onCategoryChange}
          />
        </div>
      )}

      {/* New email banner */}
      {newEmailCount != null && newEmailCount > 0 && newEmails && onDismissNewEmails && (
        <div className="px-3 pb-2">
          <NewEmailBanner
            count={newEmailCount}
            emails={newEmails}
            onDismiss={onDismissNewEmails}
          />
        </div>
      )}

      {/* Search results indicator */}
      {searchQuery && (
        <div className="px-4 pb-1">
          <p className="text-xs text-muted-foreground">
            Results for &quot;{searchQuery}&quot;
          </p>
        </div>
      )}

      {/* Email List */}
      <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {isLoading ? (
          <div>
            {Array.from({ length: 10 }, (_, i) => (
              <EmailRowSkeleton key={i} delay={i} variant={i % 3} />
            ))}
          </div>
        ) : emails.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            {searchQuery ? (
              <>
                <SearchX className="mb-3 h-10 w-10 text-muted-foreground/30" />
                <p className="text-sm font-medium text-foreground">No results found</p>
                <p className="mt-1 text-xs text-muted-foreground">Try a different search term</p>
              </>
            ) : (
              <>
                <Mail className="mb-3 h-10 w-10 text-muted-foreground/30" />
                <p className="text-sm font-medium text-foreground">You&apos;re all caught up</p>
                <p className="mt-1 text-xs text-muted-foreground">No emails in this view</p>
              </>
            )}
          </div>
        ) : (
          <>
            {/* Pinned Section */}
            {pinnedEmails.length > 0 && (
              <>
                <div className="sticky top-0 z-10 flex items-center justify-between bg-background px-4 py-1.5">
                  <span className="text-[11px] font-medium uppercase tracking-wider text-faint">
                    Pinned
                  </span>
                  <span className="text-[11px] text-faint">[{pinnedEmails.length}]</span>
                </div>
                {pinnedEmails.map((email, i) => (
                  <EmailRow
                    key={email.id}
                    email={email}
                    isSelected={
                      email.thread_id
                        ? selectedEmailId === email.thread_id || selectedEmailId === email.id
                        : selectedEmailId === email.id
                    }
                    onClick={() => onSelectEmail(email)}
                    selectMode={selectMode}
                    isChecked={selectedIds.has(email.id)}
                    onToggleSelect={onToggleSelect}
                    onToggleStar={onToggleStar}
                    isFocused={focusedEmailId === email.id}
                    threadCount={email.thread_message_count}
                    index={i}
                  />
                ))}
              </>
            )}

            {/* Primary Section */}
            <div className="sticky top-0 z-10 flex items-center justify-between bg-background px-4 py-1.5">
              <span className="text-[11px] font-medium uppercase tracking-wider text-faint">
                {pinnedEmails.length > 0 ? "Primary" : "All"}
              </span>
              <span className="text-[11px] text-faint">[{primaryEmails.length}]</span>
            </div>
            {primaryEmails.map((email, i) => (
              <EmailRow
                key={email.id}
                email={email}
                isSelected={
                  email.thread_id
                    ? selectedEmailId === email.thread_id || selectedEmailId === email.id
                    : selectedEmailId === email.id
                }
                onClick={() => onSelectEmail(email)}
                selectMode={selectMode}
                isChecked={selectedIds.has(email.id)}
                onToggleSelect={onToggleSelect}
                onToggleStar={onToggleStar}
                isFocused={focusedEmailId === email.id}
                threadCount={email.thread_message_count}
                index={i}
              />
            ))}
          </>
        )}
      </div>

      {/* Pagination */}
      {emailCount > 0 && (
        <div className="flex items-center justify-between border-t border-border px-4 py-2">
          <span className="text-xs text-faint">
            {rangeStart}–{rangeEnd}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              className="rounded-md p-1.5 text-muted-foreground hover:bg-card disabled:opacity-50"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="rounded-md p-1.5 text-muted-foreground hover:bg-card disabled:opacity-50"
              disabled={!hasNextPage}
              onClick={() => onPageChange(page + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
