"use client";

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
  onAiPrioritize?: () => void;
  connectedProviders?: string[];
  activeProvider?: string;
  onProviderChange?: (provider: string) => void;
}

export function EmailToolbar({
  onRefresh,
  onMarkRead,
  onArchive,
  onAiPrioritize,
  connectedProviders,
  activeProvider,
  onProviderChange,
}: EmailToolbarProps) {
  const buttonClass = cn(
    "rounded-md border border-input bg-background px-3 py-1.5 text-sm font-medium",
    "hover:bg-accent hover:text-accent-foreground transition-colors"
  );

  const showProviderSwitcher =
    connectedProviders && connectedProviders.length > 1 && onProviderChange;

  const tabs = showProviderSwitcher
    ? ["all", ...connectedProviders]
    : [];

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
      <button type="button" className={buttonClass} onClick={onMarkRead}>
        Mark Read
      </button>
      <button type="button" className={buttonClass} onClick={onArchive}>
        Archive
      </button>
      <button type="button" className={buttonClass} onClick={onAiPrioritize}>
        AI Prioritize
      </button>
    </div>
  );
}
