"use client";

import Link from "next/link";
import { Star, Tag, Users, Bell, MessageSquare, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { AiPriorityBadge } from "@/components/ai/ai-priority-badge";
import type { Email } from "@/hooks/use-emails";

const LABEL_CONFIG: Record<string, { icon: React.ReactNode; bg: string; label: string }> = {
  important: {
    icon: <Zap className="h-3.5 w-3.5 fill-white text-white" />,
    bg: "bg-[#F59E0D]",
    label: "Important",
  },
  promotions: {
    icon: <Tag className="h-3.5 w-3.5 fill-white text-white" />,
    bg: "bg-[#F43F5E]",
    label: "Promotions",
  },
  personal: {
    icon: <Star className="h-3.5 w-3.5 fill-white text-white" />,
    bg: "bg-[#39AE4A]",
    label: "Personal",
  },
  updates: {
    icon: <Bell className="h-3.5 w-3.5 fill-white text-white" />,
    bg: "bg-[#8B5CF6]",
    label: "Updates",
  },
  social: {
    icon: <Users className="h-3.5 w-3.5 text-white" />,
    bg: "bg-[#2563EB]",
    label: "Social",
  },
  forums: {
    icon: <MessageSquare className="h-3.5 w-3.5 text-white" />,
    bg: "bg-[#0D9488]",
    label: "Forums",
  },
  starred: {
    icon: <Star className="h-3.5 w-3.5 fill-white text-white" />,
    bg: "bg-yellow-500",
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
      <div className="flex">
        {visible.map(({ key, config }, i) => (
          <Tooltip key={`${key}-${i}`}>
            <TooltipTrigger asChild>
              <Badge
                className={cn(
                  "rounded-md border-2 border-background p-1 transition-transform",
                  config.bg,
                  i > 0 && "-ml-1.5",
                )}
              >
                {config.icon}
              </Badge>
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

function formatEmailDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const isToday =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  if (isToday) {
    return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  }

  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

interface EmailListItemProps {
  email: Email;
  threadMessageCount?: number;
  selectMode?: boolean;
  isSelected?: boolean;
  onToggleSelect?: (emailId: string) => void;
  isActive?: boolean;
  isFocused?: boolean;
  onSelect?: (email: Email) => void;
  onToggleStar?: (emailId: string, isStarred: boolean) => void;
  index?: number;
}

export function EmailListItem({ email, threadMessageCount, selectMode, isSelected, onToggleSelect, isActive, isFocused, onSelect, onToggleStar, index = 0 }: EmailListItemProps) {
  const href = email.thread_id
    ? `/thread/${email.thread_id}${email.provider ? `?provider=${email.provider}` : ""}`
    : `/email/${email.id}${email.provider ? `?provider=${email.provider}` : ""}`;

  const inner = (
    <div className="flex items-center justify-between gap-4">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        {/* Sender avatar */}
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-medium text-accent-foreground">
          {(email.sender.name || email.sender.email).charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          {/* Line 1: sender name */}
          <div className="flex items-center gap-2">
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
            <div
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggleStar?.(email.id, !email.is_starred);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  e.stopPropagation();
                  onToggleStar?.(email.id, !email.is_starred);
                }
              }}
              className="shrink-0 rounded p-0.5 transition-colors hover:bg-accent"
              title={email.is_starred ? "Unstar" : "Star"}
            >
              <Star
                className={cn(
                  "h-3.5 w-3.5",
                  email.is_starred
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-muted-foreground/40 hover:text-muted-foreground",
                )}
              />
            </div>
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
            {email.priority && <AiPriorityBadge priority={email.priority} />}
          </div>
          {/* Line 2: subject */}
          <p
            className={cn(
              "truncate text-sm",
              email.is_read ? "text-muted-foreground" : "font-medium text-foreground",
            )}
          >
            {email.subject || "(No subject)"}
          </p>
        </div>
      </div>
      {/* Right side: date, star, category badges */}
      <div className="flex shrink-0 flex-col items-end gap-1">
        <span
          className={cn(
            "text-xs whitespace-nowrap",
            email.is_read ? "text-muted-foreground/60" : "text-muted-foreground",
          )}
        >
          {formatEmailDate(email.received_at)}
        </span>
        <CategoryLabels labels={email.labels} />
      </div>
    </div>
  );

  return (
    <div
      data-email-id={email.id}
      className={cn(
        "animate-fade-slide-up flex items-center border-l-[3px] border-l-border transition-colors hover:bg-accent/50",
        isActive
          ? "bg-accent !border-l-primary"
          : isFocused
            ? "bg-accent/60 !border-l-paprika/50"
            : isSelected
              ? "bg-accent/40"
              : email.is_read
                ? "bg-muted/30 opacity-70"
                : "bg-card",
      )}
      style={{ animationDelay: `${Math.min(index * 30, 300)}ms` }}
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
