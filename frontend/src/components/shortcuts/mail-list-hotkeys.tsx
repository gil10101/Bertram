"use client";

import { useCallback, useRef, useState } from "react";
import { useHotkeys } from "@/hooks/use-hotkeys";
import type { Email } from "@/hooks/use-emails";

interface MailListHotkeysProps {
  emails: Email[];
  onSelectEmail: (email: Email) => void;
  onToggleStar: (emailId: string, isStarred: boolean) => void;
  onArchive: () => void;
  onDelete: () => void;
  onMarkRead: () => void;
  onMarkUnread?: () => void;
  onToggleSelect: (emailId: string) => void;
  onSelectAll: () => void;
  onExitSelectMode: () => void;
  onAiPrioritize: () => void;
  onLabel?: () => void;
  updateEmails: (
    ids: string[],
    data: Record<string, unknown>,
  ) => Promise<void>;
  selectMode: boolean;
  enabled: boolean;
  onFocusedEmailChange?: (emailId: string | null) => void;
}

export function MailListHotkeys({
  emails,
  onSelectEmail,
  onToggleStar,
  onArchive,
  onDelete,
  onMarkRead,
  onMarkUnread,
  onToggleSelect,
  onSelectAll,
  onExitSelectMode,
  onAiPrioritize,
  onLabel,
  updateEmails,
  enabled,
  onFocusedEmailChange,
}: MailListHotkeysProps) {
  const focusedIndexRef = useRef(-1);
  // Only this state triggers re-render (for focused highlight)
  const [, setFocusedId] = useState<string | null>(null);

  const updateFocus = useCallback(
    (index: number) => {
      focusedIndexRef.current = index;
      const id = emails[index]?.id ?? null;
      setFocusedId(id);
      onFocusedEmailChange?.(id);

      // Scroll focused item into view
      if (id) {
        const el = document.querySelector(`[data-email-id="${id}"]`);
        el?.scrollIntoView({ block: "nearest" });
      }
    },
    [emails, onFocusedEmailChange],
  );

  const getFocusedEmail = useCallback((): Email | null => {
    const idx = focusedIndexRef.current;
    return idx >= 0 && idx < emails.length ? emails[idx] : null;
  }, [emails]);

  useHotkeys(
    {
      navigateDown: () => {
        const next = Math.min(
          focusedIndexRef.current + 1,
          emails.length - 1,
        );
        updateFocus(next);
      },
      navigateUp: () => {
        const next = Math.max(focusedIndexRef.current - 1, 0);
        updateFocus(next);
      },
      openEmail: () => {
        const email = getFocusedEmail();
        if (email) onSelectEmail(email);
      },
      archiveEmail: () => {
        const email = getFocusedEmail();
        if (email) {
          onArchive();
        }
      },
      starEmail: () => {
        const email = getFocusedEmail();
        if (email) onToggleStar(email.id, !email.is_starred);
      },
      markAsRead: () => {
        const email = getFocusedEmail();
        if (email && !email.is_read) {
          updateEmails([email.id], { is_read: true });
        } else {
          onMarkRead();
        }
      },
      markAsUnread: () => {
        const email = getFocusedEmail();
        if (email && email.is_read) {
          updateEmails([email.id], { is_read: false });
        } else {
          onMarkUnread?.();
        }
      },
      deleteEmail: () => {
        onDelete();
      },
      labelEmail: () => {
        onLabel?.();
      },
      toggleSelect: () => {
        const email = getFocusedEmail();
        if (email) onToggleSelect(email.id);
      },
      selectAll: onSelectAll,
      exitSelectionMode: onExitSelectMode,
      aiPrioritize: onAiPrioritize,
    },
    "mail-list",
    enabled,
  );

  return null;
}
