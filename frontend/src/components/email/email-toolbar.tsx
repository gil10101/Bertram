"use client";

import { Archive, CheckSquare, ChevronLeft, ChevronRight, Mail, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

const KNOWN_LABELS: Record<string, string> = {
  all: "All",
  gmail: "Gmail",
  outlook: "Outlook",
};

function providerLabel(key: string): string {
  return KNOWN_LABELS[key] ?? key.charAt(0).toUpperCase() + key.slice(1);
}

interface EmailToolbarProps {
  onRefresh?: () => void;
  onMarkRead?: () => void;
  onArchive?: () => void;
  onDelete?: () => void;
  onAiPrioritize?: () => void;
  connectedProviders?: string[];
  activeProvider?: string;
  onProviderChange?: (provider: string) => void;
  page?: number;
  perPage?: number;
  emailCount?: number;
  hasNextPage?: boolean;
  onPageChange?: (page: number) => void;
  selectMode?: boolean;
  onToggleSelectMode?: () => void;
  selectedCount?: number;
}

export function EmailToolbar({
  onRefresh,
  onMarkRead,
  onArchive,
  onDelete,
  onAiPrioritize,
  connectedProviders,
  activeProvider,
  onProviderChange,
  page = 1,
  perPage = 20,
  emailCount = 0,
  hasNextPage = false,
  onPageChange,
  selectMode = false,
  onToggleSelectMode,
  selectedCount = 0,
}: EmailToolbarProps) {
  const buttonClass = cn(
    "rounded-md border border-input bg-background px-3 py-1.5 text-sm font-medium",
    "hover:bg-accent hover:text-accent-foreground transition-colors",
    "disabled:pointer-events-none disabled:opacity-50",
  );

  const showProviderSwitcher =
    connectedProviders && connectedProviders.length > 1 && onProviderChange;

  const tabs = showProviderSwitcher
    ? ["all", ...connectedProviders]
    : [];

  const rangeStart = (page - 1) * perPage + 1;
  const rangeEnd = (page - 1) * perPage + emailCount;
  const showPagination = onPageChange && (emailCount > 0 || page > 1);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {tabs.length > 0 && (
        <div className="mr-1 flex items-center gap-1 rounded-md border border-input p-0.5">
          {tabs.map((p) => (
            <button
              key={p}
              type="button"
              className={cn(
                "rounded px-3 py-1 text-sm font-medium transition-colors",
                activeProvider === p
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
              onClick={() => onProviderChange!(p)}
            >
              {providerLabel(p)}
            </button>
          ))}
        </div>
      )}
      <button type="button" className={buttonClass} onClick={onRefresh}>
        Refresh
      </button>

      {onToggleSelectMode && (
        <button
          type="button"
          className={cn(
            buttonClass,
            "inline-flex items-center gap-1.5",
            selectMode && "bg-accent text-accent-foreground",
          )}
          onClick={onToggleSelectMode}
        >
          <CheckSquare className="h-3.5 w-3.5" />
          {selectMode ? (
            <>
              Cancel
              {selectedCount > 0 && (
                <span className="ml-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-semibold text-primary-foreground">
                  {selectedCount}
                </span>
              )}
            </>
          ) : "Select"}
        </button>
      )}

      {/* Batch actions — visible when in select mode */}
      <div
        className={cn(
          "flex items-center gap-2 overflow-hidden transition-all duration-200",
          selectMode ? "max-w-[500px] opacity-100" : "max-w-0 opacity-0",
        )}
      >
        <button
          type="button"
          className={cn(buttonClass, "inline-flex items-center gap-1.5")}
          onClick={onMarkRead}
          disabled={selectedCount === 0}
        >
          <Mail className="h-3.5 w-3.5" />
          Mark Read
        </button>
        {onArchive && (
          <button
            type="button"
            className={cn(buttonClass, "inline-flex items-center gap-1.5")}
            onClick={onArchive}
            disabled={selectedCount === 0}
          >
            <Archive className="h-3.5 w-3.5" />
            Archive
          </button>
        )}
        {onDelete && (
          <button
            type="button"
            className={cn(buttonClass, "inline-flex items-center gap-1.5 text-destructive hover:text-destructive")}
            onClick={onDelete}
            disabled={selectedCount === 0}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </button>
        )}
      </div>

      <button type="button" className={cn(buttonClass, "inline-flex items-center gap-1.5")} onClick={onAiPrioritize}>
        <span className="animate-text-shimmer bg-[length:250%_100%] bg-clip-text text-transparent bg-[linear-gradient(110deg,hsl(var(--foreground))_35%,hsl(var(--primary))_50%,hsl(var(--foreground))_65%)]">
          AI Prioritize
        </span>
      </button>

      {showPagination && (
        <div className="ml-auto flex items-center gap-1">
          <span className="text-sm text-muted-foreground">
            {emailCount > 0 ? `${rangeStart}–${rangeEnd}` : "0"}
          </span>
          <button
            type="button"
            className={cn(buttonClass, "px-1.5")}
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            className={cn(buttonClass, "px-1.5")}
            disabled={!hasNextPage}
            onClick={() => onPageChange(page + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
